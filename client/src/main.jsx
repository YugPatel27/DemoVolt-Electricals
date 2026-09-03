import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./router";
import { AuthProvider } from "./lib/auth-context";
import { CartProvider } from "./lib/cart-context";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);
