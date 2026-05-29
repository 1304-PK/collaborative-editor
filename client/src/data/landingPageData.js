import {
  Zap,
  Code2,
  GitBranch,
  Cloud,
  Layers,
  Share2,
  Download,
  Infinity,
  Keyboard,
  Lock,
  Moon,
} from "lucide-react";

export const ACCENT = "#000000";
export const BG = "#dfdfdf";

export const FEATURES = [
  {
    icon: Zap,
    title: "Sub-millisecond Real-Time Sync",
    desc: "Don't let lag break your train of thought. Experience peer-to-peer speeds that ensure your team sees every stroke, connection, and text block the exact millisecond you create it.",
  },
  {
    icon: Code2,
    title: "Interactive Code & Component Blocks",
    desc: "Go beyond basic shapes. Drop syntax-highlighted code snippets, component wireframes, or database schema templates directly onto the canvas alongside your freehand sketches.",
  },
  {
    icon: GitBranch,
    title: "Instant Repository Mapping",
    desc: "Import your repository structure or API documentation straight onto the board to visually map out refactors, dependency flows, and next-gen system architectures.",
  },
  {
    icon: Cloud,
    title: "Persisted Workspaces & Versioning",
    desc: "Never lose a breakthrough idea session. Workspaces auto-save instantly to the cloud, letting you branch ideas, view version history, and roll back changes seamlessly.",
  },
];

export const STEPS = [
  {
    num: "01",
    icon: Layers,
    title: "Spin Up a Canvas",
    desc: "Click 'Launch Canvas.' No credit card required, no onboarding loops. Just a raw, infinite grid ready for your ideas.",
  },
  {
    num: "02",
    icon: Share2,
    title: "Drop a Link to Invite",
    desc: "Share a secure, ephemeral workspace link with teammates. Jump straight into a live session with ultra-low latency cursor tracking.",
  },
  {
    num: "03",
    icon: Download,
    title: "Export and Implement",
    desc: "Once architecture is locked in, export diagrams to SVG, PNG, or JSON, or generate a permanent markdown link for your repository.",
  },
];

export const TABLE_ROWS = [
  {
    icon: Infinity,
    feature: "Infinite Vector Canvas",
    detail: "Zoom from a micro-routine to massive multi-service infrastructure without losing crispness.",
    benefit: "No boundaries to your system scale.",
  },
  {
    icon: Keyboard,
    feature: "Keyboard-First Controls",
    detail: "Create shapes, connect nodes, and switch tools entirely via optimized hotkeys.",
    benefit: "Stay in flow state — hands on keyboard.",
  },
  {
    icon: Lock,
    feature: "Granular Access Control",
    detail: "Share view-only links with stakeholders while retaining full edit rights for the core team.",
    benefit: "Secure collaboration without unintended edits.",
  },
  {
    icon: Moon,
    feature: "Dark-Mode Native",
    detail: "Built from the ground up to look beautiful in low-light development environments.",
    benefit: "Reduces eye strain during late-night sessions.",
  },
];

export const FAQS = [
  {
    q: "Is there a limit to how many people can collaborate at once?",
    a: "Our real-time sync engine handles up to 50 active, simultaneous cursors on a single canvas smoothly without any performance degradation.",
  },
  {
    q: "Can I integrate this with our existing documentation?",
    a: "Absolutely. You can embed live boards or export clean vector SVGs directly into your GitHub readmes, Notion docs, or internal wikis.",
  },
  {
    q: "How secure is the data on the canvas?",
    a: "All real-time data transfers are encrypted in transit. You can host ephemeral boards that completely wipe data once the session closes.",
  },
];
