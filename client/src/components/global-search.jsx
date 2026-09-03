import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, PackageSearch, Zap } from "lucide-react";
import { searchProducts } from "../lib/catalog";
import { sanitize } from "../lib/validate";

const DEBOUNCE_MS = 150;

export function GlobalSearch({ compact = false }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Debounce filtering so fast typing doesn't re-filter the catalog on
  // every single keystroke — matters more once the catalog grows or
  // search becomes server-backed, harmless overhead today.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const results = debouncedQuery ? searchProducts(sanitize(debouncedQuery, 60)) : [];

  // Keep the highlighted row in range as results change (e.g. typing
  // narrows the list out from under the current index).
  useEffect(() => {
    setActiveIndex((idx) => (idx >= results.length ? -1 : idx));
  }, [results.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectProduct = (product) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    const targetPath = product.division === "wires" ? "/wires-cables" : "/switchgear";
    navigate(`${targetPath}?q=${encodeURIComponent(product.slug)}`);
  };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => {
        const next = idx < results.length - 1 ? idx + 1 : 0;
        listRef.current
          ?.querySelector(`[data-index="${next}"]`)
          ?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => {
        const next = idx > 0 ? idx - 1 : results.length - 1;
        listRef.current
          ?.querySelector(`[data-index="${next}"]`)
          ?.scrollIntoView({ block: "nearest" });
        return next;
      });
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        selectProduct(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${compact ? "w-full" : "w-full max-w-lg"}`}
    >
      <div
        className={`group relative flex items-center gap-2 rounded-lg border bg-[color:var(--frame)]/5 backdrop-blur-sm px-3.5 py-1.5 transition-all duration-300 ${open ? "border-[color:var(--orange)] shadow-[0_4px_20px_rgba(240,113,40,0.12)]" : "border-[color:var(--frame)]/40 hover:border-[color:var(--maroon)]/30"}`}
      >
        <Search
          className={`h-4 w-4 shrink-0 transition-colors ${open ? "text-[color:var(--orange)]" : "text-foreground/40 group-hover:text-foreground/60"}`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for wires, MCBs, brands…"
          maxLength={80}
          className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-foreground/40 font-medium text-foreground py-1 border-none ring-0 shadow-none focus:ring-0 focus:outline-none"
          aria-label="Search catalog"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          aria-autocomplete="list"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
            }}
            aria-label="Clear search"
            className="rounded-full bg-[color:var(--frame)]/20 p-1 text-foreground/40 hover:bg-[color:var(--frame)]/40 hover:text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && debouncedQuery && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[color:var(--frame)]/40 bg-white/95 backdrop-blur-xl shadow-2xl animate-fade-in ring-1 ring-black/5">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-60">
              <PackageSearch className="mb-2 h-7 w-7 text-foreground/30" />
              <p className="text-sm font-medium">No products found</p>
              <p className="text-xs mt-0.5">
                Try "house wire", "MCB", "DemoWire"…
              </p>
            </div>
          ) : (
            <div ref={listRef} className="max-h-[340px] overflow-auto py-2" role="listbox">
              <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                Products & Categories
              </div>
              <ul className="px-2">
                {results.map((product, index) => (
                  <li key={product.slug} data-index={index}>
                    <button
                      type="button"
                      id={`search-result-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectProduct(product)}
                      className={`w-full text-left group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-pointer ${index === activeIndex ? "bg-[color:var(--orange)]/10" : "hover:bg-[color:var(--orange)]/5"}`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${product.division === "wires" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"}`}
                      >
                        {product.division === "wires" ? (
                          <Zap className="h-3.5 w-3.5" />
                        ) : (
                          <PackageSearch className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-semibold text-xs text-[color:var(--maroon)] group-hover:text-[color:var(--orange)] transition-colors">
                          {product.title}
                        </div>
                        <div className="truncate text-[11px] text-foreground/50">
                          <span className="font-medium text-foreground/70">
                            {product.brands.join(" · ")}
                          </span>{" "}
                          — {product.specs}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
