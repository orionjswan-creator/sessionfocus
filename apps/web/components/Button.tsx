import { Loader2 } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
};

export function Button({ className = "", variant = "primary", isLoading, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-moss text-white hover:bg-moss/90 border-moss",
    secondary: "bg-white text-ink hover:bg-linen border-moss/25",
    danger: "bg-clay text-white hover:bg-clay/90 border-clay",
    ghost: "bg-transparent text-ink hover:bg-moss/10 border-transparent"
  };
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
