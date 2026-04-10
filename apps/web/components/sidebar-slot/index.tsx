"use client";

import { createContext, type ReactNode, use, useEffect, useState } from "react";

const SidebarSlotContext = createContext<{
  content: ReactNode;
  set: (node: ReactNode) => void;
}>({ content: null, set: () => {} });

export function SidebarSlotProvider({ children }: { children: ReactNode }) {
  const [content, set] = useState<ReactNode>(null);
  return (
    <SidebarSlotContext value={{ content, set }}>{children}</SidebarSlotContext>
  );
}

export function useSidebarSlot() {
  return use(SidebarSlotContext).content;
}

export function SidebarSlotSetter({ children }: { children: ReactNode }) {
  const { set } = use(SidebarSlotContext);
  useEffect(() => {
    set(children);
    return () => set(null);
  }, [children, set]);
  return null;
}
