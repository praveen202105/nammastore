"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Loader2, Locate } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface Prediction {
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  distance_meters: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  terms: {
    value: string;
  }[];
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

  const getGeolocation = async () => {
    try {
      const { coords } = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      setCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch {
      setError("Failed to get geolocation.");
    }
  };

  // Trigger geolocation fetch when the component mounts
  useEffect(() => {
    getGeolocation();
  }, []);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // console.log("loca  ", location);

  const fetchSuggestions = async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      if (coordinates) {
        const { latitude, longitude } = coordinates;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        const response = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?location=${latitude},${longitude}&input=${encodeURIComponent(
            input
          )}&api_key=${apiKey}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Request-Id": "unique-request-id",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch location suggestions");
        }

        const data = await response.json();
        console.log("aaa ", data);

        const suggestions = data.predictions.map(
          (prediction: Prediction): Suggestion => ({
            title: prediction.structured_formatting.main_text,
            address: prediction.structured_formatting.secondary_text,
            distance: (prediction.distance_meters / 1000).toFixed(2),
            location: {
              lat: prediction.geometry.location.lat,
              lon: prediction.geometry.location.lng,
            },
            city: prediction.terms[prediction.terms.length - 4].value.split(
              " "
            )[0],
          })
        );

        setSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Unable to fetch suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  console.log("pp", suggestions);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setError("");

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };
  // console.log("loca ", suggestions);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
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
    // console.log("sss ", selectedLocation);

    const searchParams = new URLSearchParams({
      location: selectedLocation?.city || "",
    });

    router.push(`/search?${searchParams.toString()}`);
  };

  const handleNearMeClick = async () => {
    if (coordinates?.latitude && coordinates.longitude) {
      const { latitude, longitude } = coordinates; // Destructure latitude and longitude

      try {
        setIsLoading(true);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Request-Id": "unique-request-id",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const cityName =
            data.address?.state_district?.split(" ")[0] || "Unknown City";
          console.log("City Name:", cityName);

          const searchParams = new URLSearchParams({
            location: cityName || "",
          });

          router.push(`/search?${searchParams.toString()}`);
        } else {
          console.error("Failed to fetch city name:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching city name:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("Coordinates are missing or invalid.");
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 relative"
      >
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />

          <Input
            placeholder="Enter a location"
            value={location}
            onChange={handleLocationChange}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 h-12 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
          />

          {showSuggestions && suggestions.length > 0 && (
            <Card
              className="absolute z-10 w-full mt-1 shadow-lg"
              ref={suggestionRef}
            >
              <ScrollArea className="h-64">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow text-left">
                        {" "}
                        {/* Ensures left alignment */}
                        <p className="font-semibold text-gray-800">
                          {suggestion.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {suggestion.address}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                        {suggestion.distance} km
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}

          {isLoading && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto h-12 bg-primary hover:bg-primary/90 text-white"
        >
          <Search className="mr-2 h-5 w-5" />
          Find Storage
        </Button>
      </form>
      <div className="flex justify-end mt-2 mr-40 ">
        <button
          type="button"
          onClick={handleNearMeClick}
          className="text-sm text-white font-bold flex items-center gap-1 bg-transparent hover:bg-primary/90 px-4 py-2 rounded-2xl transition-colors duration-200"
        >
          Near me <Locate className="h-3 w-3" />
        </button>
      </div>
    </>
  );
}
