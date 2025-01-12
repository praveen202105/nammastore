"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, MapPin, Luggage, Search } from "lucide-react";
import { format } from "date-fns";

export function SearchForm() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [bags, setBags] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams({
      location,
      date: date ? format(date, "yyyy-MM-dd") : "",
      bags: bags.toString(),
    });
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
    >
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 h-12 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-[200px] justify-start text-left h-12 bg-white/80 backdrop-blur-sm text-gray-800"
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
            {date ? (
              format(date, "PPP")
            ) : (
              <span className="text-gray-500">Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="relative">
        <Luggage className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="number"
          min={1}
          value={bags}
          onChange={(e) => setBags(parseInt(e.target.value))}
          className="pl-10 h-12 w-full md:w-[100px] bg-white/80 backdrop-blur-sm text-gray-800"
        />
      </div>
      <Button
        type="submit"
        className="w-full md:w-auto h-12 bg-primary hover:bg-primary/90 text-white"
      >
        <Search className="mr-2 h-5 w-5" />
        Find Storage
      </Button>
    </form>
  );
}
