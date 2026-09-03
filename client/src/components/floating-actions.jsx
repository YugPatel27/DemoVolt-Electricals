/**
 * FloatingActions — consolidates the CartFab, WhatsApp button,
 * and ScrollToTop into a single tidy column in the bottom-right corner.
 *
 * Also fires toast notifications on cart actions.
 */

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  MessageCircle,
  ShoppingBag,
  Send,
  Trash2,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { useCart } from "../lib/cart-context";
import { useAuth } from "../lib/auth-context";
import {
  isPhone,
  sanitize,
  buildWhatsAppUrl,
  VOLAMP_WA,
} from "../lib/validate";
import { showToast } from "../lib/toast";

/* ─────────────────────────────────────────────
   Scroll-to-top logic
───────────────────────────────────────────── */
function useScrolled(threshold = 400) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > threshold);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);
  return show;
}

function smoothScrollTop() {
  const startY = window.scrollY;
  const duration = Math.min(900, 200 + startY / 4);
  const startTime = performance.now();
  const ease = (progress) => progress * progress;
  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY * (1 - ease(progress)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ─────────────────────────────────────────────
   Rate-limit hook — returns a gated version of fn.
   fn can only be called once per `ms` milliseconds.
───────────────────────────────────────────── */
function useRateLimited(fn, ms = 2000) {
  const lastRef = useRef(0);
  return (...args) => {
    const now = Date.now();
    if (now - lastRef.current < ms) return;
    lastRef.current = now;
    fn(...args);
  };
}

/* ─────────────────────────────────────────────
   Cart line item — its own local "pending" state so
   +/- clicks feel instant without racing the server.
───────────────────────────────────────────── */
function CartLine({ entry, idx, onQuantityChange, onRemove }) {
  const [pending, setPending] = useState(false);

  const bump = async (delta) => {
    const next = entry.quantity + delta;
    if (next < 1 || next > 999 || pending) return;
    setPending(true);
    try {
      await onQuantityChange(entry.id, next);
    } catch {
      showToast({ message: "Couldn't update quantity.", type: "error" });
    } finally {
      setPending(false);
    }
  };

  const handleRemove = useRateLimited(async () => {
    try {
      await onRemove(entry.id);
      showToast({ message: `Removed "${entry.title}" from cart`, type: "error" });
    } catch {
      showToast({ message: "Couldn't remove that item.", type: "error" });
    }
  }, 800);

  return (
    <li className="group flex items-start justify-between gap-4 rounded-xl border border-[color:var(--frame)]/40 bg-white p-4 shadow-sm transition-all hover:border-[color:var(--orange)] hover:shadow-md">
      <div className="flex gap-3 flex-1 min-w-0">
        <span className="mt-0.5 text-[11px] font-bold text-foreground/30 shrink-0 w-4">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[color:var(--maroon)] leading-snug truncate">
            {entry.title}
          </p>
          {entry.brand && (
            <span className="mt-1.5 inline-block rounded-md bg-[color:var(--orange)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--orange)]">
              {entry.brand}
            </span>
          )}
          <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-[color:var(--frame)]/50 bg-background px-2 py-1 w-max">
            <button
              onClick={() => bump(-1)}
              disabled={entry.quantity <= 1 || pending}
              aria-label={`Decrease quantity of ${entry.title}`}
              className="p-0.5 text-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-[color:var(--maroon)]">
              {entry.quantity}
            </span>
            <button
              onClick={() => bump(1)}
              disabled={pending}
              aria-label={`Increase quantity of ${entry.title}`}
              className="p-0.5 text-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={handleRemove}
        aria-label={`Remove ${entry.title}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/30 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

/* ─────────────────────────────────────────────
   Cart Drawer
───────────────────────────────────────────── */
function CartDrawer({ onClose }) {
  const { items, loading, error, reload, updateQuantity, removeItem, clearCart } =
    useCart();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState(null);
  const [sending, setSending] = useState(false);

  // Escape key closes the drawer
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    const cleanName = sanitize(name, 80);
    const cleanPhone = sanitize(phone, 20);
    if (!cleanName) return setErr("Enter your name.");
    if (!isPhone(cleanPhone)) return setErr("Enter a valid phone number.");

    setErr(null);
    setSending(true);
    try {
      const lines = items
        .map(
          (entry, idx) =>
            `${idx + 1}. ${entry.title}${entry.brand ? ` — ${entry.brand}` : ""} × ${entry.quantity}`,
        )
        .join("\n");
      const msg = `Cart Enquiry — DemoVolt\n\n${lines}\n\nFrom: ${cleanName}\nPhone: ${cleanPhone}`;
      window.open(
        buildWhatsAppUrl(VOLAMP_WA, msg),
        "_blank",
        "noopener,noreferrer",
      );
      await clearCart();
      showToast({ message: "Enquiry sent via WhatsApp!", type: "success" });
      onClose();
    } catch {
      setErr("Couldn't send your enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white/95 backdrop-blur-md shadow-2xl border-l border-black/5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--maroon)]/5">
              <ShoppingBag className="h-5 w-5 text-[color:var(--maroon)]" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-[color:var(--maroon)]">
                Your Cart
              </h3>
              <p className="text-xs text-foreground/50">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 hover:bg-black/5 transition-colors"
          >
            <X className="h-5 w-5 text-foreground/70" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
              <ShoppingBag className="mb-4 h-12 w-12 animate-pulse text-foreground/30" />
              <p className="text-sm font-medium">Loading your cart…</p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-foreground/30" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              <button
                onClick={reload}
                className="mt-3 rounded-lg border border-[color:var(--frame)]/60 px-4 py-2 text-xs font-bold text-[color:var(--maroon)] hover:bg-[color:var(--maroon)]/5 transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
              <ShoppingBag className="mb-4 h-12 w-12 text-foreground/30" />
              <p className="text-sm font-medium">Your cart is empty.</p>
              <p className="mt-1 text-xs">
                Add products from the catalog to request a quote.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((entry, idx) => (
                <CartLine
                  key={entry.id}
                  entry={entry}
                  idx={idx}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Form */}
        {items.length > 0 && (
          <div className="border-t border-black/5 bg-white p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <form onSubmit={submit} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                    Name
                  </label>
                  <input
                    maxLength={80}
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-[color:var(--frame)]/60 bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground/50">
                    Phone
                  </label>
                  <input
                    maxLength={20}
                    required
                    placeholder="XX"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-[color:var(--frame)]/60 bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--orange)] transition-colors"
                  />
                </div>
              </div>
              {err && <p className="text-xs font-medium text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={sending}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[color:var(--orange)]/20 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Cart via WhatsApp"}
              </button>
              <p className="text-center text-[10px] uppercase tracking-widest text-foreground/40">
                Secure · Private · Direct
              </p>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export — unified FAB stack
───────────────────────────────────────────── */
export function FloatingActions() {
  const { items } = useCart();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const showScrollTop = useScrolled(400);

  const badgeCount = items.reduce((sum, entry) => sum + entry.quantity, 0);
  // Show the cart FAB once the visitor has an account context worth
  // opening a drawer for, or once it actually has items in it.
  const showCartFab = user || badgeCount > 0 || drawerOpen;

  return (
    <>
      {/* Unified FAB column */}
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3">
        {/* Scroll to top — only when scrolled */}
        <button
          type="button"
          onClick={smoothScrollTop}
          aria-label="Scroll to top"
          className={`h-11 w-11 rounded-full bg-white border border-[color:var(--frame)]/40 shadow-lg flex items-center justify-center text-[color:var(--maroon)] hover:bg-[color:var(--maroon)] hover:text-white hover:border-[color:var(--maroon)] transition-all duration-300 ${
            showScrollTop
              ? "opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 translate-y-4"
          }`}
        >
          <ArrowUp className="h-5 w-5" />
        </button>

        {/* WhatsApp */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="group relative h-11 w-11 flex items-center justify-center"
        >
          <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60" />
          <span className="relative h-11 w-11 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-[8deg]">
            <MessageCircle className="h-5 w-5" />
          </span>
        </a>

        {/* Cart */}
        {showCartFab && (
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open cart (${badgeCount} items)`}
            className="relative h-11 w-11 rounded-full brand-gradient shadow-lg flex items-center justify-center text-white hover:scale-110 hover:shadow-xl transition-all duration-200"
          >
            <ShoppingBag className="h-5 w-5" />
            {badgeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[color:var(--maroon)] shadow-sm ring-1 ring-[color:var(--orange)]/30">
                {badgeCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && <CartDrawer onClose={() => setDrawerOpen(false)} />}
    </>
  );
}
