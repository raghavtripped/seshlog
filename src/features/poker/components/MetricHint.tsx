// A column/heading label with an info icon that reveals an explanatory tooltip.
// Used to clarify non-obvious analytics metrics (BB/100, /hr, Avg net, …).

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MetricHintProps {
  label: string;
  hint: string;
  className?: string;
}

export function MetricHint({ label, hint, className }: MetricHintProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`${label}: ${hint}`}
            className="text-gray-400 transition hover:text-gray-600"
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-xs font-normal leading-snug">
          {hint}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

export default MetricHint;
