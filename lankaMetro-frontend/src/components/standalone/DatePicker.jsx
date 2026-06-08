import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    date ? new Date(date) : undefined
  );

  const handleSelect = (newDate) => {
    setSelectedDate(newDate);
    if (newDate) {
      const formatted = format(newDate, "yyyy-MM-dd");
      onDateChange(formatted);
    } else {
      onDateChange("");
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="w-full justify-start text-left"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0 bg-white border border-gray-200 shadow-md"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
}
