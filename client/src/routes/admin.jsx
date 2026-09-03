import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  Inbox,
  ShoppingCart,
  Activity,
  Lock,
  Plus,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { apiFetch, ApiError } from "../lib/api";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "carts", label: "Cart Activity", icon: ShoppingCart },
  { id: "activity", label: "Activity Log", icon: Activity },
];

export default function Admin() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const [tab, setTab] = useState("overview");

  if (authLoading) {
    return <CenteredMessage>Loading…</CenteredMessage>;
  }

  if (!user) {
    return (
      <CenteredMessage>
        <Lock className="mx-auto mb-3 h-8 w-8 text-foreground/30" />
        <p className="font-semibold">Sign in to access the admin panel.</p>
        <button
          onClick={openAuthModal}
          className="mt-4 rounded-lg brand-gradient px-4 py-2 text-xs font-bold text-white cursor-pointer"
        >
          Sign in
        </button>
      </CenteredMessage>
    );
  }

  if (user.role !== "admin" && user.role !== "staff") {
    return (
      <CenteredMessage>
        <Lock className="mx-auto mb-3 h-8 w-8 text-foreground/30" />
        <p className="font-semibold">You don't have access to this page.</p>
        <p className="mt-1 text-xs text-foreground/60">
          Signed in as {user.email}. This area is restricted to staff and
          admin accounts.
        </p>
      </CenteredMessage>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[color:var(--maroon)]">
            Admin Panel
          </h1>
          <p className="text-xs text-foreground/60">
            Signed in as {user.email} ·{" "}
            <span className="font-bold uppercase tracking-wide">
              {user.role}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-[color:var(--frame)]/30">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
              tab === t.id
                ? "bg-[color:var(--maroon)]/10 text-[color:var(--maroon)]"
                : "text-foreground/50 hover:text-foreground/80"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab isAdmin={user.role === "admin"} currentUserId={user.id} />}
      {tab === "products" && <ProductsTab isAdmin={user.role === "admin"} />}
      {tab === "enquiries" && <EnquiriesTab />}
      {tab === "carts" && <CartsTab />}
      {tab === "activity" && <ActivityTab />}
    </div>
  );
}

function CenteredMessage({ children }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">{children}</div>
  );
}

function useAdminData(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return apiFetch(path)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
}

function StatusBanner({ loading, error, onRetry }) {
  if (loading) return <p className="py-8 text-center text-xs text-foreground/50">Loading…</p>;
  if (error)
    return (
      <div className="py-8 text-center">
        <p className="text-xs font-medium text-destructive">{error}</p>
        <button
          onClick={onRetry}
          className="mt-2 rounded-lg border border-[color:var(--frame)]/50 px-3 py-1.5 text-xs font-bold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  return null;
}

// ── Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data, error, loading, reload } = useAdminData("/admin/overview");
  if (loading || error) return <StatusBanner loading={loading} error={error} onRetry={reload} />;

  const cards = [
    ["Users", data.counts.users],
    ["Products", data.counts.products],
    ["Enquiries", data.counts.enquiries],
    ["Items in carts", data.counts.cartItems],
    ["Active sessions", data.counts.activeSessions],
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[color:var(--frame)]/40 bg-white p-4"
          >
            <div className="text-2xl font-black text-[color:var(--maroon)]">
              {value}
            </div>
            <div className="text-[11px] font-medium text-foreground/60">{label}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
        Recent enquiries
      </h3>
      {data.recentEnquiries.length === 0 ? (
        <p className="text-xs text-foreground/50">No enquiries yet.</p>
      ) : (
        <ul className="divide-y divide-[color:var(--frame)]/20 rounded-lg border border-[color:var(--frame)]/30 bg-white text-xs">
          {data.recentEnquiries.map((e) => (
            <li key={e.id} className="flex justify-between px-3 py-2">
              <span className="font-medium">
                #{e.id} · {e.kind} · {e.email}
              </span>
              <span className="text-foreground/50">{e.createdAt}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Users ───────────────────────────────────────────────────────────────

function UsersTab({ isAdmin, currentUserId }) {
  const { data, error, loading, reload } = useAdminData("/admin/users?limit=100");
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const changeRole = async (id, role) => {
    setRowError(null);
    setBusyId(id);
    try {
      await apiFetch(`/admin/users/${id}/role`, { method: "PATCH", body: { role } });
      await reload();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "Couldn't update role.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading || error) return <StatusBanner loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="overflow-x-auto rounded-lg border border-[color:var(--frame)]/30 bg-white">
      {rowError && <p className="p-2 text-xs text-destructive">{rowError}</p>}
      <table className="w-full text-xs">
        <thead className="bg-[color:var(--frame)]/5 text-left text-foreground/50">
          <tr>
            <th className="px-3 py-2 font-bold">Name</th>
            <th className="px-3 py-2 font-bold">Email</th>
            <th className="px-3 py-2 font-bold">Role</th>
            <th className="px-3 py-2 font-bold">Failed attempts</th>
            <th className="px-3 py-2 font-bold">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--frame)]/15">
          {data.users.map((u) => (
            <tr key={u.id}>
              <td className="px-3 py-2 font-semibold">{u.name}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">
                {isAdmin ? (
                  <select
                    value={u.role}
                    disabled={busyId === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded border border-[color:var(--frame)]/40 bg-white px-1.5 py-1 text-[11px] font-bold"
                  >
                    <option value="customer">customer</option>
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  <span className="font-bold uppercase">{u.role}</span>
                )}
                {u.id === currentUserId && (
                  <span className="ml-1 text-[10px] text-foreground/40">(you)</span>
                )}
              </td>
              <td className="px-3 py-2">
                {u.failedAttempts}
                {u.lockedUntil && u.lockedUntil > Date.now() && (
                  <span className="ml-1 text-destructive font-bold">locked</span>
                )}
              </td>
              <td className="px-3 py-2 text-foreground/50">{u.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Products ────────────────────────────────────────────────────────────

function ProductsTab({ isAdmin }) {
  const { data, error, loading, reload } = useAdminData("/admin/products");
  const [editing, setEditing] = useState(null); // null | "new" | product object
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (product) => {
    setFormError(null);
    setEditing(
      product === "new"
        ? "new"
        : { ...product, brands: product.brands.join(", ") },
    );
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't delete product.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const form = new FormData(e.target);
    const payload = {
      slug: form.get("slug"),
      title: form.get("title"),
      division: form.get("division"),
      category: form.get("category") || null,
      group: form.get("group") || null,
      brands: String(form.get("brands") || "")
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      specs: form.get("specs") || null,
    };

    try {
      if (editing === "new") {
        await apiFetch("/admin/products", { method: "POST", body: payload });
      } else {
        await apiFetch(`/admin/products/${editing.id}`, {
          method: "PATCH",
          body: payload,
        });
      }
      setEditing(null);
      await reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || error) return <StatusBanner loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      {isAdmin && (
        <button
          onClick={() => startEdit("new")}
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg brand-gradient px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add product
        </button>
      )}

      {editing && (
        <form
          onSubmit={submit}
          className="mb-4 grid grid-cols-1 gap-2 rounded-lg border border-[color:var(--orange)]/40 bg-orange-50/40 p-4 sm:grid-cols-3"
        >
          <div className="sm:col-span-3 flex items-center justify-between">
            <h4 className="text-xs font-bold">
              {editing === "new" ? "New product" : `Editing "${editing.title}"`}
            </h4>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer text-foreground/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            name="slug"
            placeholder="slug (unique)"
            defaultValue={editing === "new" ? "" : editing.slug}
            required
            className="rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          />
          <input
            name="title"
            placeholder="Title"
            defaultValue={editing === "new" ? "" : editing.title}
            required
            className="rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          />
          <select
            name="division"
            defaultValue={editing === "new" ? "wires" : editing.division}
            className="rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          >
            <option value="wires">wires</option>
            <option value="switchgear">switchgear</option>
          </select>
          <input
            name="category"
            placeholder="Category"
            defaultValue={editing === "new" ? "" : editing.category || ""}
            className="rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          />
          <input
            name="group"
            placeholder="Group"
            defaultValue={editing === "new" ? "" : editing.group || ""}
            className="rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          />
          <input
            name="brands"
            placeholder="Brands, comma-separated"
            defaultValue={editing === "new" ? "" : editing.brands}
            className="rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          />
          <input
            name="specs"
            placeholder="Specs"
            defaultValue={editing === "new" ? "" : editing.specs || ""}
            className="sm:col-span-3 rounded border border-[color:var(--frame)]/40 px-2 py-1.5 text-xs"
          />
          {formError && (
            <p className="sm:col-span-3 text-xs text-destructive">{formError}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-3 rounded-lg brand-gradient px-3 py-1.5 text-xs font-bold text-white cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-[color:var(--frame)]/30 bg-white">
        <table className="w-full text-xs">
          <thead className="bg-[color:var(--frame)]/5 text-left text-foreground/50">
            <tr>
              <th className="px-3 py-2 font-bold">Title</th>
              <th className="px-3 py-2 font-bold">Division</th>
              <th className="px-3 py-2 font-bold">Brands</th>
              <th className="px-3 py-2 font-bold">Specs</th>
              {isAdmin && <th className="px-3 py-2 font-bold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--frame)]/15">
            {data.products.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 font-semibold">{p.title}</td>
                <td className="px-3 py-2">{p.division}</td>
                <td className="px-3 py-2 text-foreground/60">{p.brands.join(", ")}</td>
                <td className="px-3 py-2 text-foreground/60">{p.specs}</td>
                {isAdmin && (
                  <td className="px-3 py-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="mr-2 cursor-pointer text-[color:var(--maroon)]"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="cursor-pointer text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Enquiries ("orders") ─────────────────────────────────────────────────

function EnquiriesTab() {
  const { data, error, loading, reload } = useAdminData("/admin/enquiries?limit=100");
  if (loading || error) return <StatusBanner loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      <p className="mb-2 text-[11px] text-foreground/50">
        There's no checkout/payment flow on this site — these contact and
        bulk-quote submissions are the closest equivalent to "orders".
      </p>
      <div className="overflow-x-auto rounded-lg border border-[color:var(--frame)]/30 bg-white">
        <table className="w-full text-xs">
          <thead className="bg-[color:var(--frame)]/5 text-left text-foreground/50">
            <tr>
              <th className="px-3 py-2 font-bold">Kind</th>
              <th className="px-3 py-2 font-bold">Name / Company</th>
              <th className="px-3 py-2 font-bold">Email</th>
              <th className="px-3 py-2 font-bold">Phone</th>
              <th className="px-3 py-2 font-bold">Message</th>
              <th className="px-3 py-2 font-bold">Consent</th>
              <th className="px-3 py-2 font-bold">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--frame)]/15">
            {data.enquiries.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2 font-bold uppercase">{e.kind}</td>
                <td className="px-3 py-2">{e.name || e.company}</td>
                <td className="px-3 py-2">{e.email}</td>
                <td className="px-3 py-2">{e.phone}</td>
                <td className="px-3 py-2 max-w-xs truncate">{e.message}</td>
                <td className="px-3 py-2">{e.consentGiven ? "✓" : "—"}</td>
                <td className="px-3 py-2 text-foreground/50">{e.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Cart activity ─────────────────────────────────────────────────────────

function CartsTab() {
  const { data, error, loading, reload } = useAdminData("/admin/carts");
  if (loading || error) return <StatusBanner loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="overflow-x-auto rounded-lg border border-[color:var(--frame)]/30 bg-white">
      <table className="w-full text-xs">
        <thead className="bg-[color:var(--frame)]/5 text-left text-foreground/50">
          <tr>
            <th className="px-3 py-2 font-bold">User</th>
            <th className="px-3 py-2 font-bold">Product</th>
            <th className="px-3 py-2 font-bold">Brand</th>
            <th className="px-3 py-2 font-bold">Qty</th>
            <th className="px-3 py-2 font-bold">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--frame)]/15">
          {data.cartItems.map((c) => (
            <tr key={c.id}>
              <td className="px-3 py-2">
                {c.userName} <span className="text-foreground/40">({c.userEmail})</span>
              </td>
              <td className="px-3 py-2 font-semibold">{c.title}</td>
              <td className="px-3 py-2">{c.brand}</td>
              <td className="px-3 py-2">{c.quantity}</td>
              <td className="px-3 py-2 text-foreground/50">{c.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Activity log (with IP) ────────────────────────────────────────────────

function ActivityTab() {
  const { data, error, loading, reload } = useAdminData("/admin/activity?limit=100");
  if (loading || error) return <StatusBanner loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      <p className="mb-2 text-[11px] text-foreground/50">
        Security and business events — logins, registrations, password
        resets, enquiries, and cart activity — each with the IP address it
        came from. This is not a record of every click; see the project
        review notes on data minimization.
      </p>
      <div className="overflow-x-auto rounded-lg border border-[color:var(--frame)]/30 bg-white">
        <table className="w-full text-xs">
          <thead className="bg-[color:var(--frame)]/5 text-left text-foreground/50">
            <tr>
              <th className="px-3 py-2 font-bold">Action</th>
              <th className="px-3 py-2 font-bold">User</th>
              <th className="px-3 py-2 font-bold">Detail</th>
              <th className="px-3 py-2 font-bold">IP</th>
              <th className="px-3 py-2 font-bold">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--frame)]/15">
            {data.entries.map((e) => (
              <tr key={e.id}>
                <td className="px-3 py-2 font-bold">{e.action}</td>
                <td className="px-3 py-2">
                  {e.userEmail || <span className="text-foreground/40">anonymous</span>}
                </td>
                <td className="px-3 py-2 text-foreground/60">{e.detail}</td>
                <td className="px-3 py-2 font-mono">{e.ip}</td>
                <td className="px-3 py-2 text-foreground/50">{e.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
