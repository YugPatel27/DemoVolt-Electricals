import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "./api";
import { useAuth } from "./auth-context";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, requireAuth } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCart = useCallback(() => {
    if (!user) {
      setItems([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    return apiFetch("/cart")
      .then((data) => setItems(data.items))
      .catch(() => {
        // Previously this silently reset to an empty cart, which looks
        // identical to "you have no items" even when the real cause is a
        // network/server error. Surface it instead so the UI can show a
        // retry option rather than a falsely-empty cart.
        setItems([]);
        setError("Couldn't load your cart. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Load the signed-in user's cart; clear it on logout (the server cart is
  // per-user, so a guest — or a user who just logged out — has none).
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await loadCart();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [loadCart]);

  // Gated behind sign-in: if the visitor isn't logged in yet, this opens the
  // auth modal and only actually adds the item once they log in / register.
  const addToCart = useCallback(
    (product, quantity = 1) =>
      requireAuth(async () => {
        setError(null);
        const data = await apiFetch("/cart", {
          method: "POST",
          body: {
            slug: product.slug,
            title: product.title,
            brand: product.brands?.[0] ?? product.brand,
            quantity,
          },
        });
        setItems(data.items);
        return data.items;
      }),
    [requireAuth],
  );

  // Optimistic: apply the change to local state immediately so the UI
  // feels instant, then reconcile with the server response. On failure,
  // roll back to the pre-change snapshot and surface an error instead of
  // leaving the UI stuck showing a change that didn't actually persist.
  const updateQuantity = useCallback(async (itemId, quantity) => {
    setError(null);
    let previousItems;
    setItems((current) => {
      previousItems = current;
      return current.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      );
    });

    try {
      const data = await apiFetch(`/cart/${itemId}`, {
        method: "PATCH",
        body: { quantity },
      });
      setItems(data.items);
    } catch (err) {
      setItems(previousItems);
      setError("Couldn't update quantity. Please try again.");
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    setError(null);
    let previousItems;
    setItems((current) => {
      previousItems = current;
      return current.filter((item) => item.id !== itemId);
    });

    try {
      const data = await apiFetch(`/cart/${itemId}`, { method: "DELETE" });
      setItems(data.items);
    } catch (err) {
      setItems(previousItems);
      setError("Couldn't remove item. Please try again.");
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    setError(null);
    let previousItems;
    setItems((current) => {
      previousItems = current;
      return [];
    });

    try {
      const data = await apiFetch("/cart", { method: "DELETE" });
      setItems(data.items);
    } catch (err) {
      setItems(previousItems);
      setError("Couldn't clear cart. Please try again.");
      throw err;
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        reload: loadCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
