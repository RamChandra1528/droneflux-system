
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
  tooltipText?: string;
}

export function StatusCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = "text-muted-foreground",
  tooltipText,
}: StatusCardProps) {
  return (
    <Card className={cn("hover-effect overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("p-2 rounded-full", iconColor)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </TooltipTrigger>
            {tooltipText && <TooltipContent>{tooltipText}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-1">
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <div
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                <span>
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <svg
                  className={cn("h-3 w-3", !trend.isPositive && "rotate-180")}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L20 14H4L12 4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
