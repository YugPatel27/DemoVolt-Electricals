// Static catalog for the product listing UI. No prices per client brief.
// Used by /wires-cables and /switchgear and by the global search.

export const CABLE_GROUPS = [
  "Armoured & CCTV",
  "Braided & Fibre",
  "HT & House Wire",
  "LAN & Multicore",
  "Flexible & Solar",
  "Comms & Winding",
];

export const CABLE_PRODUCTS = [
  {
    slug: "aluminum-armoured-cable",
    title: "Aluminum Armoured Cable",
    division: "wires",
    category: "Armoured",
    group: "Armoured & CCTV",
    brands: ["DemoWire", "ArcLine", "BrightCore"],
    specs: "1C – 4C · 1.5 – 400 sqmm · LT / HT",
  },
  {
    slug: "cctv-cables",
    title: "CCTV Cables",
    division: "wires",
    category: "Comms",
    group: "Armoured & CCTV",
    brands: ["DemoWire", "BrightCore", "Circuita"],
    specs: "3+1 · 4+1 · copper conductor",
  },
  {
    slug: "coaxial-cables",
    title: "Coaxial Cables",
    division: "wires",
    category: "Comms",
    group: "Armoured & CCTV",
    brands: ["DemoWire", "BrightCore"],
    specs: "RG-6 · RG-11 · RG-59",
  },
  {
    slug: "braided-cables",
    title: "Braided Cables",
    division: "wires",
    category: "Braided",
    group: "Braided & Fibre",
    brands: ["ArcLine", "BrightCore"],
    specs: "Tinned copper braid · shielded",
  },
  {
    slug: "copper-armoured-cable",
    title: "Copper Armoured Cable",
    division: "wires",
    category: "Armoured",
    group: "Braided & Fibre",
    brands: ["DemoWire", "ArcLine", "BrightCore", "Circuita"],
    specs: "1C – 4C · 1.5 – 300 sqmm",
  },
  {
    slug: "fiber-optic-cable",
    title: "Fiber Optic Cable",
    division: "wires",
    category: "Comms",
    group: "Braided & Fibre",
    brands: ["BrightCore", "ArcLine"],
    specs: "SM / MM · 2 – 96 core",
  },
  {
    slug: "high-tension-cables",
    title: "High Tension Cables",
    division: "wires",
    category: "HT",
    group: "HT & House Wire",
    brands: ["ArcLine", "BrightCore"],
    specs: "11kV · 22kV · 33kV",
  },
  {
    slug: "house-wire",
    title: "House Wire",
    division: "wires",
    category: "House Wire",
    group: "HT & House Wire",
    brands: ["DemoWire", "ArcLine", "BrightCore", "Circuita"],
    specs: "1 – 6 sqmm · FR / FRLS / ZHFR",
  },
  {
    slug: "jftc-cables",
    title: "JFTC Cables",
    division: "wires",
    category: "Telecom",
    group: "HT & House Wire",
    brands: ["DemoWire", "BrightCore"],
    specs: "Jelly-filled telephone · 2 – 100 pair",
  },
  {
    slug: "lan-cables",
    title: "LAN Cables",
    division: "wires",
    category: "Comms",
    group: "LAN & Multicore",
    brands: ["DemoWire", "BrightCore", "Circuita"],
    specs: "CAT 5e · CAT 6 · CAT 6A",
  },
  {
    slug: "lugs-glands",
    title: "Lugs & Glands",
    division: "wires",
    category: "Accessories",
    group: "LAN & Multicore",
    brands: ["BrightCore", "ArcLine"],
    specs: "Copper / brass · 1.5 – 400 sqmm",
  },
  {
    slug: "multicore-flexible-cables",
    title: "Multicore Flexible Cables",
    division: "wires",
    category: "Flexible",
    group: "LAN & Multicore",
    brands: ["DemoWire", "ArcLine", "BrightCore", "Circuita"],
    specs: "2C – 24C · 0.5 – 16 sqmm",
  },
  {
    slug: "single-core-flexible",
    title: "Single Core Flexible",
    division: "wires",
    category: "Flexible",
    group: "Flexible & Solar",
    brands: ["DemoWire", "ArcLine", "BrightCore", "Circuita"],
    specs: "0.5 – 240 sqmm · FR / FRLS",
  },
  {
    slug: "solar-dc-cables",
    title: "Solar DC Cables",
    division: "wires",
    category: "Solar",
    group: "Flexible & Solar",
    brands: ["BrightCore", "ArcLine"],
    specs: "TUV · 4 / 6 / 10 sqmm · UV resistant",
  },
  {
    slug: "submersible-cable",
    title: "Submersible Cable",
    division: "wires",
    category: "Submersible",
    group: "Flexible & Solar",
    brands: ["DemoWire", "ArcLine", "BrightCore"],
    specs: "3C flat · 1.5 – 35 sqmm",
  },
  {
    slug: "telephone-switchboard-cables",
    title: "Telephone Switchboard Cables",
    division: "wires",
    category: "Telecom",
    group: "Comms & Winding",
    brands: ["DemoWire", "BrightCore"],
    specs: "2 – 50 pair · indoor",
  },
  {
    slug: "winding-wires",
    title: "Winding Wires",
    division: "wires",
    category: "Winding",
    group: "Comms & Winding",
    brands: ["BrightCore", "Circuita"],
    specs: "Enamelled copper · SWG range",
  },
  {
    slug: "welding-cables",
    title: "Welding Cables",
    division: "wires",
    category: "Welding",
    group: "Comms & Winding",
    brands: ["ArcLine", "BrightCore"],
    specs: "25 – 95 sqmm · rubber insulated",
  },
];

export const CABLE_BRANDS = ["DemoWire", "ArcLine", "BrightCore", "Circuita"];

export const SWITCHGEAR_PRODUCTS = [
  {
    slug: "mcbs",
    title: "Miniature Circuit Breakers (MCBs)",
    division: "switchgear",
    category: "Protection",
    group: "Protection",
    brands: ["GridPro", "Lumenix", "VoltEdge", "SafeCurrent"],
    specs: "SP · DP · TP · TP+N · 6 – 63 A",
  },
  {
    slug: "mccbs",
    title: "Moulded Case Circuit Breakers (MCCBs)",
    division: "switchgear",
    category: "Protection",
    group: "Protection",
    brands: ["GridPro", "Lumenix", "VoltEdge", "SafeCurrent"],
    specs: "16 – 1600 A · adjustable trip",
  },
  {
    slug: "rccb-rcbo",
    title: "RCCBs & RCBOs",
    division: "switchgear",
    category: "Protection",
    group: "Protection",
    brands: ["GridPro", "Lumenix", "VoltEdge", "SafeCurrent"],
    specs: "2P · 4P · 30 / 100 / 300 mA",
  },
  {
    slug: "distribution-boards",
    title: "Distribution Boards & Panel Boards",
    division: "switchgear",
    category: "Distribution",
    group: "Distribution",
    brands: ["GridPro", "Lumenix", "VoltEdge", "SafeCurrent"],
    specs: "SPN · TPN · IP42 – IP65",
  },
  {
    slug: "isolators-changeover",
    title: "Isolators & Changeover Switches",
    division: "switchgear",
    category: "Distribution",
    group: "Distribution",
    brands: ["GridPro", "Lumenix", "SafeCurrent"],
    specs: "Manual · Auto · 63 – 630 A",
  },
  {
    slug: "contactors-timers-relays",
    title: "Contactors, Timers & Relays",
    division: "switchgear",
    category: "Control",
    group: "Control",
    brands: ["Lumenix", "SafeCurrent"],
    specs: "9 – 300 A · AC / DC coil",
  },
  {
    slug: "modular-switches",
    title: "Modular Switches & Sockets",
    division: "switchgear",
    category: "Modular",
    group: "Modular & Industrial",
    brands: ["Lumenix", "VoltEdge"],
    specs: "6 / 16 / 20 A · plates + accessories",
  },
  {
    slug: "industrial-plugs",
    title: "Industrial Plugs & Sockets",
    division: "switchgear",
    category: "Industrial",
    group: "Modular & Industrial",
    brands: ["VoltEdge", "Lumenix"],
    specs: "16 – 125 A · 3P / 4P / 5P",
  },
  {
    slug: "enclosures",
    title: "Enclosures & Panel Boxes",
    division: "switchgear",
    category: "Enclosures",
    group: "Modular & Industrial",
    brands: ["GridPro", "Lumenix", "VoltEdge"],
    specs: "Metal · polycarbonate · IP54 – IP66",
  },
];

export const SWITCHGEAR_BRANDS = [
  "GridPro",
  "Lumenix",
  "VoltEdge",
  "SafeCurrent",
];

export const ALL_PRODUCTS = [...CABLE_PRODUCTS, ...SWITCHGEAR_PRODUCTS];

// Simple substring search across product fields, capped at 8 results
// for a fast, responsive autocomplete experience.
export function searchProducts(query) {
  if (!query) return [];
  const q = String(query).trim().toLowerCase();
  if (!q) return [];
  const results = [];
  for (let i = 0; i < ALL_PRODUCTS.length; i++) {
    const p = ALL_PRODUCTS[i];
    if (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.group.toLowerCase().includes(q) ||
      p.specs.toLowerCase().includes(q) ||
      p.brands.some((b) => b.toLowerCase().includes(q))
    ) {
      results.push(p);
      if (results.length === 8) break;
    }
  }
  return results;
}

export const BRAND_INFO = {
  DemoWire: {
    name: "DemoWire",
    site: "https://example.com/demowire",
    blurb: "Fictional sample supplier of house wires and industrial cables.",
    division: "wires",
  },
  ArcLine: {
    name: "ArcLine",
    site: "https://example.com/arcline",
    blurb: "Fictional sample supplier of power and specialty cables.",
    division: "wires",
  },
  BrightCore: {
    name: "BrightCore",
    site: "https://example.com/brightcore",
    blurb: "Fictional sample supplier of wires and cable accessories.",
    division: "wires",
  },
  Circuita: {
    name: "Circuita",
    site: "https://example.com/circuita",
    blurb: "Fictional sample supplier of domestic and industrial wires.",
    division: "wires",
  },
  GridPro: {
    name: "GridPro",
    site: "https://example.com/gridpro",
    blurb: "Fictional sample supplier of protection and distribution gear.",
    division: "switchgear",
  },
  Lumenix: {
    name: "Lumenix",
    site: "https://example.com/lumenix",
    blurb: "Fictional sample supplier of low-voltage control products.",
    division: "switchgear",
  },
  VoltEdge: {
    name: "VoltEdge",
    site: "https://example.com/voltedge",
    blurb: "Fictional sample supplier of modular wiring devices.",
    division: "switchgear",
  },
  SafeCurrent: {
    name: "SafeCurrent",
    site: "https://example.com/safecurrent",
    blurb: "Fictional sample supplier of industrial switchgear and control gear.",
    division: "switchgear",
  },
};
