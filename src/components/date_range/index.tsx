import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { DateRangePicker } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// Define the range type
export interface DateRange {
  startDate?: Date;
  endDate?: Date;
  key: string;
  label?: string;
}

interface DateFilterBarProps {
  onRangeChange?: (range: DateRange) => void;
}

const quickOptions = [
  { label: "Today", daysOffset: 0 },
  { label: "Week", daysOffset: 7 },
  { label: "Month", daysOffset: 30 },
  { label: "Year", daysOffset: 365 },
  { label: "All", daysOffset: null }, // null means no filter
];

export function DateFilterBar({ onRangeChange }: DateFilterBarProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    key: "selection",
    label: "Today",
  });
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const handleQuickSelect = (option: (typeof quickOptions)[0]) => {
    let startDate: Date | undefined = new Date();
    let endDate: Date | undefined = new Date();
    let label = option.label;

    if (option.daysOffset === null) {
      // All: set to null to represent no filter
      startDate = undefined;
      endDate = undefined;
    } else if (option.daysOffset === 0) {
      // Today: start and end are today
      startDate = new Date();
      endDate = new Date();
    } else {
      // e.g., last 7 days: end = today, start = today - daysOffset
      startDate = new Date(
        new Date().setDate(new Date().getDate() - option.daysOffset),
      );
      endDate = new Date();
    }

    const newRange = { startDate, endDate, key: "selection", label };
    setSelectedRange(newRange);
    onRangeChange?.(newRange);
  };

  const handleCustomSelect = (ranges: any) => {
    const range = ranges.selection;

    const newRange: DateRange = {
      startDate: range.startDate,
      endDate: range.endDate,
      key: "selection",
      label: "Custom",
    };

    setSelectedRange(newRange);
    onRangeChange?.(newRange);
    setIsCustomOpen(false);
  };

  const formatRangeText = () => {
    if (!selectedRange.startDate || !selectedRange.endDate) return "All time";
    return `${format(selectedRange.startDate, "MMM d, yyyy")} - ${format(
      selectedRange.endDate,
      "MMM d, yyyy",
    )}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-background border-b">

      {quickOptions.map((option) => (
        <Button
          key={option.label}
          variant={selectedRange.label === option.label ? "default" : "outline"}
          size="sm"
          onClick={() => handleQuickSelect(option)}
          className="px-3"
        >
          {option.label}
        </Button>
      ))}

      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedRange.label === "Custom" ? "default" : "outline"}
            size="sm"
            className="gap-1"
          >
            Custom
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          {/* @ts-ignore - showSelectionPreview prop is valid but types missing */}
          <DateRangePicker
            onChange={handleCustomSelect}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={[selectedRange]}
            direction="horizontal"
            rangeColors={["#3b82f6"]}
            staticRanges={[]}
            inputRanges={[]}
          />
        </PopoverContent>
      </Popover>

      <div className="ml-auto text-sm text-muted-foreground hidden sm:block">
        {formatRangeText()}
      </div>
    </div>
  );
}
