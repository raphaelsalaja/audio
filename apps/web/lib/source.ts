import { docs } from "fumadocs-mdx:collections/server";
import type { InferMetaType, InferPageType } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;
