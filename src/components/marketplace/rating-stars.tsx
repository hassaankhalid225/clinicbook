import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  showValue = false,
  count,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted",
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      )}
      {count != null && (
        <span className="text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
