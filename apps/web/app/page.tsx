import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { PatchList } from "@/components/patch-list";
import { getPatches, type SortMode } from "@/lib/patches";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <Hero />
      <Suspense>
        <PatchesSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function PatchesSection({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawSort = typeof params.sort === "string" ? params.sort : "alltime";
  const sort: SortMode = ["alltime", "trending", "hot"].includes(rawSort)
    ? (rawSort as SortMode)
    : "alltime";

  const patches = await getPatches(sort);

  return (
    <div id="patches">
      <PatchList patches={patches} sort={sort} />
    </div>
  );
}
