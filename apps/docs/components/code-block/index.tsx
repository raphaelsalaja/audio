import { codeToTokens } from "shiki";
import type { TabItemWithTokens } from "./client";
import { Pre, TabsClient } from "./client";

interface TabItem {
  label: string;
  value: string;
}

async function tokenize(code: string): Promise<TabItemWithTokens["tokens"]> {
  const { tokens } = await codeToTokens(code, {
    lang: "bash",
    themes: {
      light: "snazzy-light",
      dark: "slack-dark",
    },
    defaultColor: false,
  });
  return (tokens[0] ?? []).map((token) => ({
    content: token.content,
    offset: token.offset,
    style: token.htmlStyle ?? (token.color ? { color: token.color } : {}),
  }));
}

async function Tabs({ items }: { items: TabItem[] }) {
  const tokenizedItems: TabItemWithTokens[] = await Promise.all(
    items.map(async (item) => ({
      ...item,
      tokens: await tokenize(item.value),
    })),
  );

  return <TabsClient items={tokenizedItems} />;
}

export { Pre, Tabs };
