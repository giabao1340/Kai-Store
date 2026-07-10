"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              "transition-transform",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default",
            )}
          >
            <Star
              className={cn(
                SIZE[size],
                "transition-colors",
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200",
                !readonly &&
                  !filled &&
                  "hover:fill-yellow-300 hover:text-yellow-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
