"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../lib/utils"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function Button({
  children,
  onClick,
  loading = false,
  loadingText,
  icon,
  disabled = false,
  variant = "primary",
  size = "default",
  className,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full rounded-xl text-sm font-medium shadow-sm",
        "transition-colors duration-300",
        "flex items-center justify-center gap-2",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
        variant === "secondary" && "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600",
        variant === "outline" && "border-2 border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-100 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:border-zinc-500",
        "disabled:bg-zinc-200 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-400 disabled:cursor-not-allowed",
        size === "default" && "px-4 py-3",
        size === "sm" && "px-3 py-2 text-xs rounded-sm",
        size === "lg" && "px-6 py-4 text-base",
        className,
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText || "Loading..."}
        </>
      ) : (
        <>
          {children}
          {icon && icon}
        </>
      )}
    </button>
  )
}

