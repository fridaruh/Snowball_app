import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-ink)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[var(--radius-md)] border border-[var(--gray-300)] bg-white",
            "px-4 py-3 text-sm text-[var(--color-ink)] placeholder-[var(--gray-600)]",
            "min-h-[48px] transition-colors",
            "focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20",
            "disabled:bg-[var(--gray-100)] disabled:text-[var(--gray-600)]",
            error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-[var(--error)]" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
