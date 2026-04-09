import { neon } from "@neondatabase/serverless";
import { type NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL ?? "");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  const rows = await sql`
    SELECT patch_json, source_url
    FROM patches WHERE name = ${name}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const patch = rows[0];

  if (patch.patch_json) {
    return NextResponse.json(patch.patch_json, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  }

  const sourceUrl = patch.source_url as string | null;
  if (!sourceUrl) {
    return NextResponse.json(
      { error: "Patch has no source URL or cached JSON" },
      { status: 404 },
    );
  }

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch patch from source: ${res.status}` },
      { status: 502 },
    );
  }

  const patchData = await res.json();

  await sql`
    UPDATE patches SET patch_json = ${JSON.stringify(patchData)}::jsonb
    WHERE name = ${name}
  `;

  return NextResponse.json(patchData, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
