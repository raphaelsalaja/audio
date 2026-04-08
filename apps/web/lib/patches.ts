import { neon } from "@neondatabase/serverless";
import { cache } from "react";

const sql = neon(process.env.DATABASE_URL!);

export type PatchWithStats = {
  id: number;
  name: string;
  author: string;
  description: string;
  tags: string[];
  soundCount: number;
  url: string;
  source: string | null;
  sourceUrl: string | null;
  loads: number;
};

function rowToPatch(row: Record<string, unknown>): PatchWithStats {
  return {
    id: row.id as number,
    name: row.name as string,
    author: row.author as string,
    description: row.description as string,
    tags: row.tags as string[],
    soundCount: row.sound_count as number,
    url: row.url as string,
    source: (row.source as string) ?? null,
    sourceUrl: (row.source_url as string) ?? null,
    loads: Number(row.loads),
  };
}

export async function getPatchesAllTime(): Promise<PatchWithStats[]> {
  const rows = await sql`
    SELECT p.*, COUNT(pl.id)::int AS loads
    FROM patches p
    LEFT JOIN patch_loads pl ON pl.patch_id = p.id
    GROUP BY p.id
    ORDER BY loads DESC;
  `;
  return rows.map(rowToPatch);
}

export async function getPatchesTrending(): Promise<PatchWithStats[]> {
  const rows = await sql`
    SELECT p.*, COUNT(pl.id)::int AS loads
    FROM patches p
    LEFT JOIN patch_loads pl ON pl.patch_id = p.id
      AND pl.loaded_at > NOW() - INTERVAL '24 hours'
    GROUP BY p.id
    ORDER BY loads DESC;
  `;
  return rows.map(rowToPatch);
}

export async function getPatchesHot(): Promise<PatchWithStats[]> {
  const rows = await sql`
    SELECT p.*,
      SUM(
        CASE WHEN pl.loaded_at IS NOT NULL
          THEN EXP(-0.1 * EXTRACT(EPOCH FROM (NOW() - pl.loaded_at)) / 86400.0)
          ELSE 0
        END
      )::float AS loads
    FROM patches p
    LEFT JOIN patch_loads pl ON pl.patch_id = p.id
      AND pl.loaded_at > NOW() - INTERVAL '7 days'
    GROUP BY p.id
    ORDER BY loads DESC;
  `;
  return rows.map(rowToPatch);
}

export const getPatchByName = cache(
  async (name: string): Promise<PatchWithStats | null> => {
    const rows = await sql`
    SELECT p.*, COUNT(pl.id)::int AS loads
    FROM patches p
    LEFT JOIN patch_loads pl ON pl.patch_id = p.id
    WHERE p.name = ${name}
    GROUP BY p.id;
  `;
    if (rows.length === 0) return null;
    return rowToPatch(rows[0]);
  },
);

export type PatchSound = {
  id: number;
  name: string;
  category: string;
  description: string | null;
};

export type PatchSoundsByCategory = {
  category: string;
  sounds: PatchSound[];
};

export async function getPatchSounds(
  patchId: number,
): Promise<PatchSoundsByCategory[]> {
  const rows = await sql`
    SELECT id, name, category, description
    FROM patch_sounds
    WHERE patch_id = ${patchId}
    ORDER BY category, name;
  `;

  const grouped = new Map<string, PatchSound[]>();
  for (const row of rows) {
    const sound: PatchSound = {
      id: row.id as number,
      name: row.name as string,
      category: row.category as string,
      description: (row.description as string) ?? null,
    };
    const existing = grouped.get(sound.category);
    if (existing) {
      existing.push(sound);
    } else {
      grouped.set(sound.category, [sound]);
    }
  }

  return Array.from(grouped, ([category, sounds]) => ({ category, sounds }));
}

export type SortMode = "alltime" | "trending" | "hot" | "popular";

export async function getPatches(sort: SortMode): Promise<PatchWithStats[]> {
  switch (sort) {
    case "trending":
      return getPatchesTrending();
    case "hot":
      return getPatchesHot();
    case "popular":
      return getPatchesAllTime();
    default:
      return getPatchesAllTime();
  }
}
