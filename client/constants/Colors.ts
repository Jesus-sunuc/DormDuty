export const Colors = {
  light: {
    text: "#1b1f22",
    background: "#f5f7f4",
    surface: "#ffffff",
    muted: "#d6e0da",
    tint: "#27ae60",
    icon: "#6b9080",
    tabIconDefault: "#a3bcc9ad",
    tabIconSelected: "#27ae60",
    // Gradient colors for buttons and interactive elements
    gradientPrimary: ["#27ae60", "#219a52", "#1e8449"] as const,
    gradientSecondary: ["#6b9080", "#5a7d6e", "#4a6b5c"] as const,
    // Shadow and accent colors
    shadowColor: "#27ae60",
    borderAccent: "rgba(39, 174, 96, 0.3)",
  },
  dark: {
    text: "#f1f5f9",
    background: "#1c1c1e",
    surface: "#262626",
    muted: "#3a3a3a",
    tint: "#34d399",
    icon: "#6ee7b7",
    tabIconDefault: "#a3bcc9ad",
    tabIconSelected: "#34d399",
    // Gradient colors for buttons and interactive elements
    gradientPrimary: ["#34d399", "#10b981", "#059669"] as const,
    gradientSecondary: ["#6ee7b7", "#4ade80", "#22c55e"] as const,
    // Shadow and accent colors
    shadowColor: "#34d399",
    borderAccent: "rgba(52, 211, 153, 0.3)",
  },
} as const;
