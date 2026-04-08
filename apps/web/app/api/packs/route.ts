import { neon } from "@neondatabase/serverless";
import { type NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

interface PackJson {
  name: string;
  author?: string;
  version?: string;
  description?: string;
  tags?: string[];
  sounds: Record<string, unknown>;
}

function validatePack(data: unknown): data is PackJson {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.sounds === "object" &&
    obj.sounds !== null &&
    !Array.isArray(obj.sounds)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing required field: url" },
        { status: 400 },
      );
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch pack from URL: ${res.status}` },
        { status: 400 },
      );
    }

    let packData: unknown;
    try {
      packData = await res.json();
    } catch {
      return NextResponse.json(
        { error: "URL did not return valid JSON" },
        { status: 400 },
      );
    }

    if (!validatePack(packData)) {
      return NextResponse.json(
        { error: "Invalid pack format: must have name and sounds" },
        { status: 400 },
      );
    }

    const slug = packData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const soundCount = Object.keys(packData.sounds).length;
    const tags = packData.tags ?? [];
    const author = packData.author ?? "unknown";
    const description = packData.description ?? "";

    const existing = await sql`
      SELECT id FROM patches WHERE name = ${slug}
    `;

    let patchId: number;

    if (existing.length > 0) {
      patchId = existing[0].id as number;
      await sql`
        UPDATE patches SET
          author = ${author},
          description = ${description},
          tags = ${tags as string[]},
          sound_count = ${soundCount},
          source_url = ${url},
          pack_json = ${JSON.stringify(packData)}::jsonb
        WHERE id = ${patchId}
      `;
    } else {
      const inserted = await sql`
        INSERT INTO patches (name, author, description, tags, sound_count, url, source_url, pack_json)
        VALUES (
          ${slug},
          ${author},
          ${description},
          ${tags as string[]},
          ${soundCount},
          ${slug},
          ${url},
          ${JSON.stringify(packData)}::jsonb
        )
        RETURNING id
      `;
      patchId = inserted[0].id as number;
    }

    await sql`DELETE FROM patch_sounds WHERE patch_id = ${patchId}`;

    const soundNames = Object.keys(packData.sounds);
    for (const soundName of soundNames) {
      await sql`
        INSERT INTO patch_sounds (patch_id, name, category)
        VALUES (${patchId}, ${soundName}, ${"sounds"})
      `;
    }

    return NextResponse.json({
      ok: true,
      name: slug,
      sounds: soundCount,
      url: `https://audio-kit.dev/library/${slug}`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        p.name,
        p.author,
        p.description,
        p.tags,
        p.sound_count,
        p.source_url,
        COUNT(pl.id)::int AS loads
      FROM patches p
      LEFT JOIN patch_loads pl ON pl.patch_id = p.id
      GROUP BY p.id
      ORDER BY loads DESC
    `;

    const packs = rows.map((row) => ({
      name: row.name as string,
      file: `${row.name as string}.json`,
      author: row.author as string,
      description: (row.description as string) ?? "",
      tags: (row.tags as string[]) ?? [],
      soundCount: row.sound_count as number,
      sourceUrl: (row.source_url as string) ?? null,
      loads: Number(row.loads),
    }));

    return NextResponse.json(packs, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
