import type { Metadata } from "next";
import { Suspense } from "react";
import { PatchList } from "@/components/patch-list";
import { getPatchesAllTime } from "@/lib/patches";

export const metadata: Metadata = {
  title: "Library",
  description: "Browse and discover community sound packs for your UI.",
};

export default function PatchesPage() {
  return (
    <Suspense>
      <PatchesSection />
    </Suspense>
  );
}

async function PatchesSection() {
  const patches = await getPatchesAllTime();

  return (
    <div id="library">
      <PatchList patches={patches} />
    </div>
  );
}
