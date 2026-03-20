import { cn } from "@/lib/utils";
import React from "react";

interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Section = ({ id, children, className, containerClassName }: SectionProps) => {
  return (
    <section 
      id={id} 
      className={cn(
        "py-24 relative overflow-hidden",
        className
      )}
    >
      <div className={cn("container mx-auto px-4 md:px-6", containerClassName)}>
        {children}
      </div>
    </section>
  );
};
