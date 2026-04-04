import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatchDetail } from "@/components/patch-detail";
import { getPatchByName, getPatchSounds } from "@/lib/patches";

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const patch = await getPatchByName(name);
  if (!patch) return { title: "Not Found" };

  return {
    title: `${patch.name} by ${patch.author}`,
    description: patch.description,
  };
}

export default async function PatchPage({ params }: Props) {
  const { name } = await params;
  const patch = await getPatchByName(name);
  if (!patch) notFound();

  const sounds = await getPatchSounds(patch.id);

  return <PatchDetail patch={patch} sounds={sounds} />;
}
