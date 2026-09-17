"use client";

/**
 * Button — Reusable button component
 *
 * Variants: primary (Saffron/Amber), outline, danger, ghost, secondary
 * Sizes: sm, md, lg
 */

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  id,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-700 hover:to-amber-600 focus:ring-orange-400 shadow-md hover:shadow-lg active:scale-[0.98] border-none",
    outline:
      "border-2 border-orange-500 text-orange-600 hover:bg-orange-50 focus:ring-orange-400 active:scale-[0.98]",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm hover:shadow-md active:scale-[0.98]",
    ghost:
      "text-stone-600 hover:bg-stone-100 focus:ring-stone-300 active:scale-[0.98]",
    secondary:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm hover:shadow-md active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}