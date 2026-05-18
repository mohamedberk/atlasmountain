import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm shadow-red-500/20 hover:from-red-700 hover:to-red-600 hover:shadow-md",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-red-500/20 hover:from-red-600 hover:to-rose-600 hover:shadow-md",
        outline:
          "border border-red-500/20 bg-red-50/5 text-red-600 shadow-sm hover:bg-red-500/10 hover:text-red-700",
        secondary:
          "bg-red-500/20 text-red-600 border border-red-500/30 shadow-sm hover:bg-red-500/30",
        ghost:
          "text-red-600/70 hover:bg-red-500/5 hover:text-red-600",
        link:
          "text-red-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
