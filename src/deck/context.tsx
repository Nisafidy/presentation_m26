import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import type { Copy, CopyKey } from "./copy";

type DeckApi = {
  copy: Copy;
  editing: boolean;
  set: (key: CopyKey, value: string) => void;
};

const Ctx = createContext<DeckApi | null>(null);

export function DeckProvider({ value, children }: { value: DeckApi; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDeck() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Deck manquant");
  return ctx;
}

export function E({
  k,
  className,
  multi = false,
}: {
  k: CopyKey;
  className?: string;
  multi?: boolean;
}) {
  const { copy, editing, set } = useDeck();
  const value = copy[k] ?? "";
  const ref = useRef<HTMLSpanElement>(null);

  const fill = (el: HTMLSpanElement | null) => {
    ref.current = el;
    if (!el || !editing) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !editing) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  }, [editing, value]);

  if (!editing) {
    return (
      <span className={cn(className, multi && "is-multi")}>{value}</span>
    );
  }

  return (
    <span
      ref={fill}
      className={cn("edit-target", className, multi && "is-multi")}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={k}
      spellCheck
      onBlur={(event) => {
        const raw = event.currentTarget.innerText.replace(/\u00a0/g, " ");
        const next = multi ? raw.replace(/\n+$/g, "").trim() : raw.replace(/\s+/g, " ").trim();
        if (next !== value) set(k, next);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (!multi && event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(text));
        selection.collapseToEnd();
      }}
    />
  );
}
