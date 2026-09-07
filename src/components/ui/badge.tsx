import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2AAAA0] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]",
        secondary:
          "border-transparent bg-[#2AAAA0] text-white hover:bg-[#259990]",
        destructive:
          "border-transparent bg-[#C95959] text-white hover:bg-[#B84A4A]",
        outline: "text-[#2D2D2D] border-[#2D2D2D]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
