import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export interface PatchJson {
  name: string;
  author?: string;
  version?: string;
  description?: string;
  license?: string;
  compatibility?: string;
  sounds: Record<string, unknown>;
}

export const patches = pgTable(
  "patches",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    author: text().notNull(),
    description: text().notNull(),
    soundCount: integer("sound_count").default(0).notNull(),
    url: text().notNull(),
    source: text(),
    sourceUrl: text("source_url"),
    patchJson: jsonb("patch_json").$type<PatchJson>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    version: text(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    license: text(),
    compatibility: text(),
    featured: boolean().default(false).notNull(),
    verified: boolean().default(false).notNull(),
    forkedFrom: integer("forked_from"),

    // derived from patch_json at insert/update time
    sourceTypes: text("source_types").array().default([]).notNull(),
    hasEffects: boolean("has_effects").default(false).notNull(),
    hasLayers: boolean("has_layers").default(false).notNull(),
    fileSize: integer("file_size").default(0).notNull(),
  },
  (table) => [
    unique("patches_name_key").on(table.name),
    foreignKey({
      columns: [table.forkedFrom],
      foreignColumns: [table.id],
      name: "patches_forked_from_fkey",
    }),
  ],
);

export const patchLoads = pgTable(
  "patch_loads",
  {
    id: serial().primaryKey().notNull(),
    patchId: integer("patch_id").notNull(),
    loadedAt: timestamp("loaded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_patch_loads_loaded_at").using(
      "btree",
      table.loadedAt.asc().nullsLast(),
    ),
    index("idx_patch_loads_patch_id").using(
      "btree",
      table.patchId.asc().nullsLast(),
    ),
    foreignKey({
      columns: [table.patchId],
      foreignColumns: [patches.id],
      name: "patch_loads_patch_id_fkey",
    }),
  ],
);

export const patchSounds = pgTable(
  "patch_sounds",
  {
    id: serial().primaryKey().notNull(),
    patchId: integer("patch_id").notNull(),
    name: text().notNull(),
    category: text().notNull(),
    description: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.patchId],
      foreignColumns: [patches.id],
      name: "patch_sounds_patch_id_fkey",
    }),
    unique("patch_sounds_patch_id_name_key").on(table.patchId, table.name),
  ],
);

export const patchesRelations = relations(patches, ({ many }) => ({
  loads: many(patchLoads),
  sounds: many(patchSounds),
}));

export const patchLoadsRelations = relations(patchLoads, ({ one }) => ({
  patch: one(patches, {
    fields: [patchLoads.patchId],
    references: [patches.id],
  }),
}));

export const patchSoundsRelations = relations(patchSounds, ({ one }) => ({
  patch: one(patches, {
    fields: [patchSounds.patchId],
    references: [patches.id],
  }),
}));

export type Patch = typeof patches.$inferSelect;
export type NewPatch = typeof patches.$inferInsert;
export type PatchLoad = typeof patchLoads.$inferSelect;
export type PatchSoundRow = typeof patchSounds.$inferSelect;
