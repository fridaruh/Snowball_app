"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "text" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // base
          "inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:bg-[var(--gray-300)] disabled:text-[var(--gray-600)]",
          // variant
          variant === "primary" && [
            "rounded-[var(--radius-pill)]",
            "bg-[var(--color-primary)] text-[var(--color-ink)]",
            "hover:brightness-90 focus-visible:ring-[var(--color-primary)]",
          ],
          variant === "secondary" && [
            "rounded-[var(--radius-pill)]",
            "bg-transparent border border-[var(--color-ink)] text-[var(--color-ink)]",
            "hover:bg-[var(--gray-100)] focus-visible:ring-[var(--gray-300)]",
          ],
          variant === "dark" && [
            "rounded-[var(--radius-pill)]",
            "bg-[var(--color-ink)] text-[var(--color-white)]",
            "hover:brightness-110 focus-visible:ring-[var(--color-ink)]",
          ],
          variant === "text" && [
            "rounded-[var(--radius-md)]",
            "bg-transparent text-[var(--color-ink)]",
            "hover:bg-[var(--gray-100)] focus-visible:ring-[var(--gray-300)]",
          ],
          variant === "danger" && [
            "rounded-[var(--radius-md)]",
            "bg-red-50 text-[var(--error)] border border-red-200",
            "hover:bg-red-100 focus-visible:ring-red-300",
          ],
          // size — primary/secondary/dark always hit 48px min-height per design system
          size === "sm" && "px-4 py-2 text-sm min-h-[44px]",
          size === "md" && "px-5 py-3 text-sm min-h-[48px]",
          size === "lg" && "px-6 py-3.5 text-base min-h-[48px]",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
