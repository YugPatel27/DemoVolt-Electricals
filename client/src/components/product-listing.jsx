import { useMemo, useState, useEffect } from "react";
import { PlusCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../lib/toast";
import { ProductDetailModal } from "./product-detail-modal";

const PRODUCTS_PER_PAGE = 12;

export function ProductListing({ products, brands, image, groups }) {
  const { items, addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const initial = searchParams.get("q") || "";
  const [query, setQuery] = useState(initial);
  const [brand, setBrand] = useState("All");
  const [group, setGroup] = useState("All");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);

  const added = useMemo(
    () => new Set(items.map((entry) => entry.slug)),
    [items],
  );

  useEffect(() => {
    if (initial) setQuery(initial);
  }, [initial]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (brand !== "All" && !product.brands.includes(brand)) return false;
      if (group !== "All" && product.group !== group) return false;
      if (
        needle &&
        !`${product.title} ${product.specs} ${product.brands.join(" ")} ${product.slug}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      return true;
    });
  }, [products, brand, group, query]);

  const activeFilters = [
    query ? `Search: ${query}` : null,
    brand !== "All" ? brand : null,
    group !== "All" ? group : null,
  ].filter(Boolean);
  const hasActiveFilters = activeFilters.length > 0;

  const clearFilters = () => {
    setQuery("");
    setBrand("All");
    setGroup("All");
  };

  // Whenever the result set changes, go back to page 1 rather than
  // stranding the visitor on a page that may no longer exist.
  useEffect(() => {
    setPage(1);
  }, [query, brand, group]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PRODUCTS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE,
      ),
    [filtered, currentPage],
  );

  // If the visitor isn't logged in yet, addToCart() opens the login/register
  // modal first and adds the item automatically right after they sign in.
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      showToast({
        message: `"${product.title}" added to cart`,
        type: "success",
      });
    } catch (err) {
      if (err?.message !== "cancelled") {
        showToast({
          message: err?.errors?.[0] || "Couldn't add that item to your cart.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 h-max rounded-2xl border border-[color:var(--frame)]/40 bg-white shadow-xl shadow-[color:var(--frame)]/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Filters
            </p>
            <p className="text-xs text-foreground/70 font-medium">
              {filtered.length} / {products.length} products
            </p>
          </div>

          <button
            onClick={() => setOpenFilter((v) => !v)}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--orange)] lg:hidden"
          >
            {openFilter ? "Hide" : "Show"}
          </button>
        </div>

        {hasActiveFilters && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="rounded-full border border-[color:var(--frame)]/50 bg-[color:var(--orange)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--maroon)]"
              >
                {filter}
              </span>
            ))}
          </div>
        )}

        <div
          className={`${openFilter ? "block" : "hidden"} lg:block space-y-4`}
        >
          <FilterGroup label="Search Catalog">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={60}
              placeholder="Type SKU or name…"
              className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-background px-3 py-2 text-xs outline-none transition-colors duration-200 ease-out focus:border-[color:var(--orange)] focus:ring-[color:var(--orange)]/20 focus:ring-1"
            />
          </FilterGroup>
          <div className="h-px w-full bg-[color:var(--frame)]/30" />
          <FilterGroup label="Brand">
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-white px-2.5 py-2 text-xs outline-none focus:border-[color:var(--orange)] focus:ring-2 focus:ring-[color:var(--orange)]/20 transition-all font-medium text-[color:var(--maroon)]"
            >
              {["All", ...brands].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FilterGroup>
          <div className="h-px w-full bg-[color:var(--frame)]/30" />
          <FilterGroup label="Category">
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-white px-2.5 py-2 text-xs outline-none focus:border-[color:var(--orange)] focus:ring-2 focus:ring-[color:var(--orange)]/20 transition-all font-medium text-[color:var(--maroon)]"
            >
              {["All", ...groups].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FilterGroup>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full rounded-xl border border-[color:var(--frame)]/60 bg-[color:var(--frame)]/15 px-3 py-1.5 text-xs font-semibold text-[color:var(--maroon)] transition-colors hover:bg-[color:var(--orange)]/10 cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </aside>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-y-1">
          <p className="text-xs text-foreground/70 font-medium">
            Showing{" "}
            <strong>
              {filtered.length === 0
                ? 0
                : (currentPage - 1) * PRODUCTS_PER_PAGE + 1}
              –{Math.min(currentPage * PRODUCTS_PER_PAGE, filtered.length)}
            </strong>{" "}
            of {filtered.length} products
            {hasActiveFilters && filtered.length < products.length && (
              <>
                {" "}
                <span className="text-foreground/40">
                  (filtered by {activeFilters.join(", ")})
                </span>
              </>
            )}
          </p>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[color:var(--orange)] hover:underline cursor-pointer"
            >
              View full catalogue ({products.length})
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((product) => (
            <article
              key={product.slug}
              className="group card-lift flex flex-col overflow-hidden rounded-xl border border-[color:var(--frame)]/40 bg-white hover:border-[color:var(--orange)] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer transition-all"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-[5/4] overflow-hidden bg-[color:var(--frame)]/10">
                <img
                  src={image}
                  alt={product.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--orange)]">
                  {product.brands.slice(0, 3).join(" · ")}
                </p>
                <h3 className="mt-1 font-display text-base font-bold text-[color:var(--maroon)] leading-snug">
                  {product.title}
                </h3>
                <p className="mt-1 text-xs text-foreground/60 leading-normal">
                  {product.specs}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={added.has(product.slug)}
                  className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${added.has(product.slug) ? "border-[color:var(--orange)] bg-[color:var(--orange)]/10 text-[color:var(--maroon)]" : "border-[color:var(--maroon)] text-[color:var(--maroon)] hover:bg-[color:var(--maroon)] hover:text-white"}`}
                >
                  {added.has(product.slug) ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Added
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-3.5 w-3.5" /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-md border border-dashed border-[color:var(--frame)]/60 p-8 text-center text-xs text-foreground/60">
              No products match your filters.
            </div>
          )}
        </div>

        {filtered.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </section>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          image={image}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  const [jumpValue, setJumpValue] = useState("");

  const goTo = (p) => {
    const clamped = Math.min(Math.max(p, 1), totalPages);
    if (clamped === currentPage) return;
    onChange(clamped);
    // Scroll back to the top of the listing so the new page is visible.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJump = (e) => {
    e.preventDefault();
    const parsed = Number.parseInt(jumpValue, 10);
    if (Number.isInteger(parsed)) goTo(parsed);
    setJumpValue("");
  };

  // Build a compact page list: first, last, current ± 1, with ellipses
  // for gaps rather than every single page number — stays readable
  // whether there are 5 pages or 200.
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1)
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const showJumpToPage = totalPages > 8;

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <nav
        aria-label="Product pages"
        className="flex flex-wrap items-center justify-center gap-1.5"
      >
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--frame)]/50 text-[color:var(--maroon)] hover:border-[color:var(--orange)] hover:bg-[color:var(--orange)]/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1.5 text-xs text-foreground/40 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-xs font-bold transition-colors cursor-pointer ${
                p === currentPage
                  ? "border-[color:var(--maroon)] bg-[color:var(--maroon)] text-white"
                  : "border-[color:var(--frame)]/50 text-[color:var(--maroon)] hover:border-[color:var(--orange)] hover:bg-[color:var(--orange)]/10"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--frame)]/50 text-[color:var(--maroon)] hover:border-[color:var(--orange)] hover:bg-[color:var(--orange)]/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>

      <div className="flex items-center gap-3 text-[11px] text-foreground/50 font-medium">
        <span>
          Page <strong className="text-foreground/80">{currentPage}</strong>{" "}
          of {totalPages}
        </span>

        {showJumpToPage && (
          <form onSubmit={handleJump} className="flex items-center gap-1.5">
            <span className="text-foreground/40">·</span>
            <label htmlFor="page-jump" className="sr-only">
              Go to page
            </label>
            <input
              id="page-jump"
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              placeholder="Go to…"
              className="w-16 rounded-lg border border-[color:var(--frame)]/50 bg-white px-2 py-1 text-xs text-center outline-none focus:border-[color:var(--orange)] focus:ring-1 focus:ring-[color:var(--orange)]/30 transition-colors"
            />
            <button
              type="submit"
              className="rounded-lg border border-[color:var(--frame)]/50 px-2.5 py-1 text-xs font-bold text-[color:var(--maroon)] hover:border-[color:var(--orange)] hover:bg-[color:var(--orange)]/10 transition-colors cursor-pointer"
            >
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/50">
        {label}
      </p>
      {children}
    </div>
  );
}
