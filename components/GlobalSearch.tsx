"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  Newspaper,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SearchResultItem, SearchResults } from "@/lib/types";

type FlatResult = SearchResultItem & {
  group: keyof SearchResults;
};

const emptyResults: SearchResults = {
  members: [],
  projects: [],
  documents: [],
  news: [],
};

const groupMeta: Record<
  keyof SearchResults,
  { label: string; icon: LucideIcon }
> = {
  members: { label: "Members", icon: Users },
  projects: { label: "Projects", icon: Layers },
  documents: { label: "Documents", icon: FileText },
  news: { label: "News", icon: Newspaper },
};

const SearchContext = createContext<{ openSearch: () => void }>({
  openSearch: () => {},
});

export function useGlobalSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      <GlobalSearchDialog open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  );
}

function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const flatResults = useMemo(() => {
    const flat: FlatResult[] = [];
    for (const group of Object.keys(groupMeta) as (keyof SearchResults)[]) {
      for (const item of results[group]) {
        flat.push({ ...item, group });
      }
    }
    return flat;
  }, [results]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(emptyResults);
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (q.length < 2) {
      setResults(emptyResults);
      setLoading(false);
      setSelected(0);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = (await res.json()) as SearchResults;
          setResults(data);
          setSelected(0);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onOpenChange(false);
      return;
    }
    if (flatResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((i) => (i - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(flatResults[selected].href);
    }
  }

  if (!open) return null;

  const hasQuery = query.trim().length >= 2;
  const hasResults = flatResults.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="surface-glass w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, projects, documents, news…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md border border-line bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
            esc
          </kbd>
        </div>

        <div className="max-h-[min(50vh,420px)] overflow-y-auto p-2">
          {!hasQuery && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              Type at least 2 characters to search
            </p>
          )}

          {hasQuery && loading && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              Searching…
            </p>
          )}

          {hasQuery && !loading && !hasResults && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          )}

          {hasQuery &&
            !loading &&
            (Object.keys(groupMeta) as (keyof SearchResults)[]).map(
              (group) => {
                const items = results[group];
                if (items.length === 0) return null;
                const { label, icon: GroupIcon } = groupMeta[group];
                return (
                  <div key={group} className="mb-2">
                    <p className="section-label px-3 py-2">{label}</p>
                    <ul>
                      {items.map((item) => {
                        const flatIndex = flatResults.findIndex(
                          (f) => f.id === item.id && f.group === group
                        );
                        const active = flatIndex === selected;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => navigate(item.href)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                active
                                  ? "bg-indigo-50 text-ink"
                                  : "text-ink/90 hover:bg-panel"
                              }`}
                              onMouseEnter={() => setSelected(flatIndex)}
                            >
                              <GroupIcon
                                size={16}
                                className="shrink-0 text-muted"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {item.title}
                                </p>
                                {item.subtitle && (
                                  <p className="truncate text-xs text-muted">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }
            )}
        </div>
      </div>
    </div>
  );
}
