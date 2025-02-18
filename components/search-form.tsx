"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2, Locate } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "./ui/separator";

interface Suggestion {
  title: string;
  address: string;
  distance: string;
  location: {
    lat: number;
    lon: number;
  };
  city: string;
}

export function SearchForm() {
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY || "";
  const router = useRouter();
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Suggestion>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setCoordinates({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => setError("Failed to get geolocation.")
    );
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);

    try {
      if (coordinates) {
        const { latitude, longitude } = coordinates;
        const response = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?location=${latitude},${longitude}&input=${encodeURIComponent(
            input
          )}&api_key=${apiKey}`
        );
        if (!response.ok)
          throw new Error("Failed to fetch location suggestions");

        const data = await response.json();
        setSuggestions(
          data.predictions.map((prediction: any) => ({
            title: prediction.structured_formatting.main_text,
            address: prediction.structured_formatting.secondary_text,
            distance: (prediction.distance_meters / 1000).toFixed(2),
            location: prediction.geometry.location,
            city:
              prediction.terms[prediction.terms.length - 4]?.value.split(
                " "
              )[0] || "",
          }))
        );
        setShowSuggestions(true);
      }
    } catch {
      setError("Unable to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setError("");
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(
      () => fetchSuggestions(e.target.value),
      300
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setLocation(suggestion.title);
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setError("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError("Please select a location from the suggestions.");
      setTimeout(() => setError(""), 2000);
      return;
    }
    router.push(`/search?location=${selectedLocation?.city || ""}`);
  };

  const handleNearMeClick = async () => {
    if (coordinates) {
      const { latitude, longitude } = coordinates;
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        if (!response.ok) throw new Error("Failed to fetch city name");

        const data = await response.json();
        const cityName =
          data.address?.state_district?.split(" ")[0] || "Unknown City";
        router.push(`/search?location=${cityName}`);
      } catch {
        setError("Error fetching location.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 relative"
      >
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1a237e]" />
          <Input
            placeholder="Search a location"
            value={location}
            onChange={handleLocationChange}
            onFocus={() => setShowSuggestions(true)}
            className="pl-12 h-12  bg-white shadow-md rounded-lg text-gray-800 placeholder-gray-500"
          />

          {showSuggestions && suggestions.length > 0 && (
            <Card
              ref={suggestionRef}
              className="absolute z-10 w-full mt-1 shadow-lg rounded-md border border-gray-200 bg-white"
            >
              <ScrollArea className="h-64">
                {suggestions.map((suggestion, index) => (
                  <div key={index}>
                    <div
                      className="p-4 flex justify-between hover:bg-gray-100 cursor-pointer transition-all duration-150"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div>
                        <p className="font-semibold">{suggestion.title}</p>
                        <p className="text-sm text-gray-600">
                          {suggestion.address}
                        </p>
                      </div>
                      <span className="text-xs bg-[#1a237e] text-white px-2 py-1 rounded-md h-10 w-10">
                        {suggestion.distance} km
                      </span>
                    </div>

                    {index < suggestions.length - 1 && (
                      <Separator className="my-2 bg-gray-200" />
                    )}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto h-12 bg-[#1a237e] shadow-lg transition"
        >
          <Search className="mr-2 h-5 w-5" />
          Find Storage
        </Button>
      </form>

      <div className="flex justify-between mt-2">
        <div className="py-2">
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          )}
          {error && <p className="mt-2 text-bold text-red-500">{error}</p>}
        </div>
        <div>
          <button
            type="button"
            onClick={handleNearMeClick}
            className="text-sm font-semibold flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm hover:bg-gray-200 transition"
          >
            Near me <Locate className="h-4 w-4 text-[#1a237e]" />
          </button>
        </div>
      </div>
    </>
  );
}
