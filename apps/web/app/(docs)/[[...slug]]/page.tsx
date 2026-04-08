import { findNeighbour } from "fumadocs-core/page-tree";
import { notFound } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";
import { SoundBuilder } from "@/components/builder";
import { Card, CardGrid } from "@/components/card";
import { Pre, Tabs } from "@/components/code-block";
import { CopyForLLM } from "@/components/copy-for-llm";
import { Demo, DemoGrid } from "@/components/demo";
import { Playground } from "@/components/playground";
import { PageNav } from "@/components/page-nav";
import proseStyles from "@/components/prose/styles.module.css";
import { TableWrapper } from "@/components/prose/table-wrapper";
import { Step, Steps } from "@/components/steps";
import { TableOfContents } from "@/components/toc";
import { source } from "@/lib/source";
import styles from "./styles.module.css";

function Table(props: ComponentPropsWithoutRef<"table">) {
  return (
    <TableWrapper>
      <table {...props} />
    </TableWrapper>
  );
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  const page = source.getPage(params.slug);

  if (!page) notFound();

  const { body: MDX, toc } = page.data;

  const tree = source.getPageTree();

  const neighbours = findNeighbour(tree, page.url);

  return (
    <>
      <article className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{page.data.title}</h1>
          <CopyForLLM />
        </div>
        <div className={proseStyles.prose}>
          <MDX
            components={{
              pre: Pre,
              table: Table,
              Steps,
              Step,
              Card,
              CardGrid,
              Demo,
              DemoGrid,
              Playground,
              SoundBuilder,
              Tabs,
            }}
          />
        </div>
        <PageNav previous={neighbours.previous} next={neighbours.next} />
      </article>
      <TableOfContents toc={toc} />
    </>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: `https://audio-kit.dev${page.url}`,
    },
  };
}
