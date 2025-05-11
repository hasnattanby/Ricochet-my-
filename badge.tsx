import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary-50 text-primary-800 ring-primary-500/10 dark:bg-primary-900 dark:text-primary-200",
        success: "bg-green-100 text-green-800 ring-green-500/10 dark:bg-green-900 dark:text-green-200",
        destructive: "bg-red-100 text-red-800 ring-red-500/10 dark:bg-red-900 dark:text-red-200",
        warning: "bg-yellow-100 text-yellow-800 ring-yellow-500/10 dark:bg-yellow-900 dark:text-yellow-200",
        outline: "text-foreground bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
