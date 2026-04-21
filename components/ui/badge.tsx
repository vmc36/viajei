import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        comida: "border-transparent bg-orange-500/10 text-orange-700 dark:text-orange-300",
        bebida: "border-transparent bg-purple-500/10 text-purple-700 dark:text-purple-300",
        atividade: "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-300",
        transporte: "border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-300",
        hospedagem: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        outro: "border-transparent bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
