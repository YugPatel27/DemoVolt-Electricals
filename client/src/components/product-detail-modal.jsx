import { useEffect, useState } from "react";
import { X, Check, Plus, Minus } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { showToast } from "../lib/toast";

export function ProductDetailModal({ product, image, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // If the visitor isn't logged in, addToCart() opens the login/register
  // modal and only resolves once they've signed in — so the item lands in
  // the cart automatically right after auth, with no extra click here.
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product, quantity);
      showToast({
        message: `"${product.title}" (Qty: ${quantity}) added to cart`,
        type: "success",
      });
      onClose();
    } catch (err) {
      if (err?.message !== "cancelled") {
        showToast({
          message: err?.errors?.[0] || "Couldn't add that item to your cart.",
          type: "error",
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, quantity + delta);
    setQuantity(newQty);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-up ring-1 ring-black/5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-foreground/50 hover:bg-black/5 hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-8 p-6 sm:p-8 sm:grid-cols-2">
          {/* Product Image */}
          <div className="flex items-center justify-center rounded-2xl bg-[color:var(--frame)]/10 aspect-square overflow-hidden">
            <img
              src={image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--orange)]">
                {product.brands.join(" · ")}
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold text-[color:var(--maroon)] leading-tight">
                {product.title}
              </h2>

              {/* Specifications */}
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Specifications
                  </p>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {product.specs}
                  </p>
                </div>

                {/* Key Attributes */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-3">
                    Key Attributes
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[color:var(--frame)]/40 bg-[color:var(--frame)]/5 p-3">
                      <p className="text-xs text-foreground/60">Category</p>
                      <p className="font-semibold text-[color:var(--maroon)]">
                        {product.category}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[color:var(--frame)]/40 bg-[color:var(--frame)]/5 p-3">
                      <p className="text-xs text-foreground/60">Group</p>
                      <p className="font-semibold text-[color:var(--maroon)]">
                        {product.group}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Action */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-[color:var(--frame)]/60 bg-background px-3 py-2.5">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-1 text-foreground/50 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-12 text-center bg-transparent text-sm font-semibold outline-none"
                      min="1"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-1 text-foreground/50 hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl brand-gradient px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[color:var(--orange)]/20 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                <Check className="h-4 w-4" />
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>

              <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
                Quick & Easy Quotation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
