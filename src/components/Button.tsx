"use client";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "ghost";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const variantStyles: Record<string, { bg: string; color: string; border: string }> = {
  primary: { bg: "var(--color-accent)", color: "#fff", border: "var(--color-accent)" },
  danger: { bg: "var(--color-accent)", color: "#fff", border: "var(--color-accent)" }, // override below
  ghost: { bg: "transparent", color: "var(--color-neutral-600)", border: "var(--color-divider)" },
};

export function Button({ children, variant = "primary", size = "md", type, disabled, onClick, className = "", style = {}, title }: ButtonProps) {
  const v = variantStyles[variant];
  const isDanger = variant === "danger";
  const isSm = size === "sm";
  const isGhost = variant === "ghost";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      type={type || "button"}
      className={`inline-flex items-center font-bold cursor-pointer ${className}`}
      style={{
        padding: isSm ? "2px 8px" : "4px 12px",
        fontSize: isSm ? 11 : 13,
        background: disabled ? "var(--color-divider)" : isDanger ? "#dc3545" : isGhost ? "transparent" : v.bg,
        color: disabled ? "var(--color-neutral-500)" : isDanger ? "#fff" : isGhost ? "var(--color-neutral-600)" : v.color,
        border: `1px solid ${disabled ? "var(--color-divider)" : isDanger ? "#dc3545" : isGhost ? "var(--color-divider)" : v.border}`,
        opacity: disabled ? 0.6 : 1,
        fontFamily: "var(--font-heading)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
