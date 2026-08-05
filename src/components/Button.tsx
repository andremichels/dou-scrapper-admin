"use client";

import { primary, danger, ghost } from "@/lib/colors";

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

export function Button({ children, variant = "primary", size = "md", type, disabled, onClick, className = "", style = {}, title }: ButtonProps) {
  const v = variant === "danger" ? danger : variant === "ghost" ? ghost : primary;
  const isSm = size === "sm";

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
        background: disabled ? "var(--color-divider)" : v.bg,
        color: disabled ? "var(--color-neutral-500)" : v.color,
        border: `1px solid ${disabled ? "var(--color-divider)" : v.border}`,
        opacity: disabled ? 0.6 : 1,
        fontFamily: "var(--font-heading)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
