import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Phone,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { GlobalSearch } from "./global-search";
import { QuickOrderButton } from "./quick-order-modal";
import { useAuth } from "../lib/auth-context";
import { showToast } from "../lib/toast";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/wires-cables", label: "Wires & Cables" },
  { to: "/switchgear", label: "Switchgear" },
  { to: "/brands", label: "Brands" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

export function BrandMark({ className = "" }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 leading-none ${className}`}
    >
      <span
        aria-hidden
        className="brand-gradient inline-block h-7 w-7 rounded-md"
        style={{
          clipPath:
            "polygon(15% 55%, 40% 80%, 90% 15%, 78% 8%, 40% 60%, 26% 45%)",
        }}
      />

      <span className="flex flex-col">
        <span
          className="font-display text-2xl font-bold tracking-tight"
          style={{ color: "var(--maroon)" }}
        >
          Volamp
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--orange)" }}
        >
          Elektrikals
        </span>
      </span>
    </Link>
  );
}

function AccountControl({ className = "" }) {
  const { user, loading, logout, openAuthModal } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await logout();
      showToast({ message: "Logged out.", type: "success" });
    } catch {
      showToast({ message: "Couldn't log out. Try again.", type: "error" });
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={openAuthModal}
        className={`inline-flex items-center gap-1.5 rounded-full border border-[color:var(--maroon)]/20 px-4 py-1.5 text-xs font-bold text-[color:var(--maroon)] hover:bg-[color:var(--maroon)]/5 transition-all cursor-pointer ${className}`}
      >
        <User className="h-3.5 w-3.5" />
        Log in
      </button>
    );
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--maroon)]/20 bg-[color:var(--orange)]/10 px-4 py-1.5 text-xs font-bold text-[color:var(--maroon)] hover:bg-[color:var(--orange)]/20 transition-all cursor-pointer"
      >
        <User className="h-3.5 w-3.5" />
        <span className="max-w-[110px] truncate">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-[color:var(--frame)]/40 bg-white shadow-xl">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-[color:var(--frame)]/10 hover:text-[color:var(--maroon)] transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);

  // Dynamic slider indicator state
  const [sliderStyle, setSliderStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Update slider position for current active link or on hover
  const updateSlider = (element) => {
    if (element && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      setSliderStyle({
        left: rect.left - navRect.left,
        width: rect.width,
        opacity: 1,
      });
    }
  };

  const hideSlider = () => {
    // Return to active element
    const activeEl = navRef.current?.querySelector(".nav-link-active");
    if (activeEl) {
      updateSlider(activeEl);
    } else {
      setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(hideSlider, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-[color:var(--frame)]/20">
      <div className="h-1 brand-gradient" />
      <div className="mx-auto flex max-w-7xl items-center gap-4 md:gap-6 px-4 py-2.5 md:py-3.5 md:px-6">
        <BrandMark />

        <nav
          ref={navRef}
          onMouseLeave={hideSlider}
          className="hidden lg:flex relative items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider py-1"
        >
          {/* Animated sliding indicator pill */}
          <span
            className="absolute bottom-0 h-0.5 brand-gradient rounded-full transition-all duration-300 ease-out pointer-events-none"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
              opacity: sliderStyle.opacity,
            }}
          />

          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onMouseEnter={(e) => updateSlider(e.currentTarget)}
              className={({ isActive }) =>
                `whitespace-nowrap transition-colors px-3 py-1.5 rounded-md ${
                  isActive
                    ? "nav-link-active text-[color:var(--maroon)] bg-[color:var(--orange)]/10"
                    : "text-foreground/70 hover:text-[color:var(--maroon)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex flex-1 min-w-[160px] max-w-xs lg:max-w-sm shrink">
          <GlobalSearch compact />
        </div>

        <div className="hidden md:flex items-center gap-2.5 ml-auto shrink-0">
          <QuickOrderButton className="hidden lg:inline-flex text-xs px-3 py-1.5" />
          <Link
            to="/contact"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[color:var(--maroon)]/20 bg-[color:var(--orange)]/10 px-4 py-1.5 text-xs font-bold text-[color:var(--maroon)] hover:bg-[color:var(--orange)]/20 transition-all cursor-pointer hover:scale-105"
          >
            Get Quote
          </Link>
          <AccountControl className="shrink-0" />
        </div>

        <button
          className="ml-auto md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--frame)]/30 bg-[color:var(--frame)]/5 text-[color:var(--maroon)] hover:bg-[color:var(--frame)]/10 cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`va-hamburger ${open ? "open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        className={`md:hidden fixed inset-0 top-[65px] z-40 transition-opacity ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40"
        />

        <div
          className={`absolute inset-x-0 top-0 bg-white border-b border-[color:var(--frame)]/20 shadow-lg transition-transform duration-300 ${
            open ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="p-4">
            <div className="mb-3 px-0 py-1">
              <GlobalSearch compact />
            </div>
            <nav className="mt-2 flex flex-col gap-0.5">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "text-[color:var(--maroon)] bg-[color:var(--orange)]/10"
                        : "text-foreground/70 hover:bg-[color:var(--frame)]/10 hover:text-[color:var(--maroon)]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-[color:var(--frame)]/20">
              <QuickOrderButton className="w-full justify-center text-xs py-2" />
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--maroon)]/20 bg-[color:var(--orange)]/10 px-4 py-2 text-xs font-bold text-[color:var(--maroon)] hover:bg-[color:var(--orange)]/20"
              >
                Get Quote
              </Link>
              <AccountControl className="w-full justify-center [&>button]:w-full [&>button]:justify-center" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="mt-16 text-xs"
      style={{ backgroundColor: "var(--maroon)", color: "#f5efe6" }}
    >
      <div className="h-1 brand-gradient" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-white">
              Volamp
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ color: "var(--orange)" }}
            >
              Elektrikals
            </span>
          </div>
          <p className="mt-2.5 text-white/70 leading-relaxed text-xs">
            Volamp Elektrikals Private Limited — full-range distributor of
            wires, cables, switchgear and electrical accessories in Gujarat.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2.5 uppercase tracking-wider text-[11px]">
            Explore
          </h4>
          <ul className="space-y-1.5 text-white/70 text-xs">
            {NAV.slice(1).map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="hover:text-[color:var(--orange)] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2.5 uppercase tracking-wider text-[11px]">
            Reach us
          </h4>
          <ul className="space-y-2 text-white/70 text-xs">
            <li className="flex gap-2">
              <MapPin
                className="h-3.5 w-3.5 mt-0.5 shrink-0"
                style={{ color: "var(--orange)" }}
              />
              <span>
                1753, Dhobi's Pole, Sir Chinubhai Road, Khadia, Ahmedabad
                380001
              </span>
            </li>
            <li className="flex gap-2">
              <Phone
                className="h-3.5 w-3.5 mt-0.5 shrink-0"
                style={{ color: "var(--orange)" }}
              />
              <a
                href="tel:+919512355502"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                +91 95123 55502
              </a>
            </li>
            <li className="flex gap-2">
              <Mail
                className="h-3.5 w-3.5 mt-0.5 shrink-0"
                style={{ color: "var(--orange)" }}
              />
              <a
                href="mailto:info@volampelektrikals.com"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                info@volampelektrikals.com
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2.5 uppercase tracking-wider text-[11px]">
            Company
          </h4>
          <ul className="space-y-1.5 text-white/70 text-xs">
            <li>
              <Link
                to="/privacy"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                Terms of Use
              </Link>
            </li>
            <li>
              <Link
                to="/legal"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                Legal &amp; Compliance
              </Link>
            </li>
            <li>
              <Link
                to="/channel-partner"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                Channel Partner
              </Link>
            </li>
            <li>
              <a
                href="https://heyzine.com/flip-book/3f385cd761.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[color:var(--orange)] transition-colors"
              >
                Catalogue →
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mr-1">
                Connect:
              </span>
              <a
                href="https://linkedin.com/company/volamp-elektrikals"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon social-icon--linkedin inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white cursor-pointer"
                aria-label="LinkedIn"
              >
                <Linkedin className="social-icon__glyph h-3.5 w-3.5" />
              </a>
              <a
                href="https://facebook.com/volampelektrikals"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon social-icon--facebook inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook className="social-icon__glyph h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com/volampelektrikals"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon social-icon--instagram inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="social-icon__glyph h-3.5 w-3.5" />
              </a>
              <a
                href="https://twitter.com/volampelektrikals"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon social-icon--twitter inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white cursor-pointer"
                aria-label="Twitter"
              >
                <Twitter className="social-icon__glyph h-3.5 w-3.5" />
              </a>
            </div>
            <div className="text-white/50 text-[11px] text-center md:text-right">
              <span className="block text-[color:var(--orange)] font-semibold">
                Prototype website
              </span>
              <span className="block mt-1">
                © {new Date().getFullYear()} Volamp Elektrikals Private Limited.
                All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
