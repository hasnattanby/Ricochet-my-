import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("container mx-auto px-4 py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
