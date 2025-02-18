/* eslint-disable react/jsx-no-undef */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  ZoomIn,
  ZoomOut,
  Layers,
  Star,
  List,
  Map,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
// import { OlaMaps } from "@/sdk/OlaMapsWebSDKNew";

interface StorageLocation {
  _id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  ownerName: string;
  timings: string;
  isOpen: boolean;
  pricePerDay: number;
  pricePerMonth: { [key: string]: number };
  capacity: number;
  contactNumber: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  latitude: number;
  longitude: number;
}

interface Location {
  name: string;
  address: string;
  city: string;
  timings: string;
  isOpen: boolean;
  pricePerDay: number;
  capacity: number;
  _id: string;
  pincode: string;
  ownerName: string;
  contactNumber: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface Data {
  locations?: Location[];
}

import { Suspense } from "react";
import Loading from "./loading";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY || "";
  const searchParams = useSearchParams();
  const location = searchParams?.get("location") || "";

  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [showMap, setShowMap] = useState(false); // Added state for map visibility

  useEffect(() => {
    setContainer(document.getElementById("map"));
  }, []);

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    import("@/sdk/OlaMapsWebSDKNew").then((module) => {
      const { OlaMaps } = module;
      const olaMaps = new OlaMaps({ apiKey });
      const myMap = olaMaps.init({
        style:
          "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: "map", // The ID of your map container
        zoom: 20,
      });

      const calculateCenter = () => {
        if (locations.length > 0) {
          const totalLocations = locations.length;
          const totalLat = locations.reduce(
            (sum, loc) => sum + loc.latitude,
            0
          );
          const totalLng = locations.reduce(
            (sum, loc) => sum + loc.longitude,
            0
          );

          const centerLat = totalLat / totalLocations;
          const centerLng = totalLng / totalLocations;
          return [centerLng, centerLat];
        }

        return [coordinates?.longitude, coordinates?.latitude]; // Fallback to a default center
      };

      const calculatedCenter = calculateCenter();
      myMap.setCenter(calculatedCenter);

      locations.forEach((location) => {
        const popup = olaMaps.addPopup({ offset: [0, -30], anchor: "bottom" }) // Offset adjusted for popup above the marker
          .setHTML(`
        <div class="text-black p-3 min-w-[150px] font-sans">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 rounded-full text-white text-sm" 
              style="background: ${location.isOpen ? "#22c55e" : "#94a3b8"};">
              ${location.isOpen ? "Open" : "Closed"}
            </span>
            <div class="flex items-center text-sm text-gray-500">
              ⭐ 4.8
            </div>
          </div>
          
          <h3 class="font-semibold text-lg mb-1">${location.name}</h3>
          
          
          <div class="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" 
              viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            ${location.timings}
          </div>
          
          <div class="flex justify-between items-center mt-2">
            <div>
              <div class="text-gray-500 text-xs">from</div>
              <div class="font-semibold">₹${location.pricePerDay}/day</div>
            </div>
          </div>
        </div>
      `);

        olaMaps
          .addMarker({ offset: [0, -9], anchor: "bottom", color: "black" }) // Offset adjusted for marker alignment
          .setLngLat([location.longitude, location.latitude]) // lng, lat order
          .setPopup(popup) // Associate the popup with the marker
          .addTo(myMap); // Add the marker (and popup) to the map
      });
      myMap.setZoom(10);
    });
  }, [coordinates, container, apiKey, locations]);

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

  useEffect(() => {
    getGeolocation();
  }, []);

  const transformToStorageLocation = (location: Location): StorageLocation => {
    return {
      _id: location._id,
      name: location.name,
      address: location.address,
      city: location.city,
      pincode: location.pincode,
      ownerName: location.ownerName,
      timings: location.timings,
      isOpen: location.isOpen,
      pricePerDay: location.pricePerDay,
      pricePerMonth: { small: 0, medium: 0, large: 0 },
      capacity: location.capacity,
      contactNumber: location.contactNumber,
      description: location.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      latitude: location.latitude,
      longitude: location.longitude,
    };
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/store/getbycity?city=${location}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data: Data = await response.json();
        // console.log("aaa ", data.locations);

        if (data.locations) {
          const transformedLocations = data.locations.map(
            transformToStorageLocation
          );

          setLocations(transformedLocations);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Something went wrong");
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [location]);

  const handleBookNow = (locationId: string, locationData: StorageLocation) => {
    const token = Cookies.get("authToken");

    if (!token) {
      router.push(
        `/signin?callback=${encodeURIComponent(
          `/book/${locationId}?locationdata=${JSON.stringify(locationData)}`
        )}`
      );
    } else {
      router.push(
        `/book/${locationId}?locationdata=${encodeURIComponent(
          JSON.stringify(locationData)
        )}`
      );
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!locations) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative md:w-[15%] w:full">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>
            <div className="flex justify-between items-center gap-2 w-full md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>

              {/* Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Map className="w-4 h-4" />
                )}
                {showMap ? "Show List" : "Show Map"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        <div
          className={`${
            showMap ? "hidden" : "w-full"
          } md:w-[450px] md:block border-r bg-white`}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Storage Locations in {location}
            </h2>
            <ScrollArea className="md:h-[calc(100vh-250px)] h-[calc(100vh-300px)] overflow-y-auto">
              <div className="space-y-4">
                {locations.map((loc) => (
                  <Card
                    key={loc._id}
                    className="border-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="rounded-full text-xs">
                              {loc.isOpen ? "Open" : "Closed"}
                            </Badge>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm ml-1">4.8</span>
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">
                            {loc.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {loc.address}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {loc.timings}
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <div className="mb-2">
                            <p className="text-sm text-gray-600">from</p>
                            <p className="font-semibold">
                              ₹{loc.pricePerDay.toFixed(2)}/day
                            </p>
                          </div>
                          <Button
                            onClick={() => handleBookNow(loc._id, loc)}
                            className="w-full bg-[#4bb4f8] hover:bg-[#3aa3e7] text-white"
                          >
                            Book now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Side - Map */}
        <div
          className={`${
            !showMap ? "hidden" : "w-full"
          } md:flex-1 md:block relative h-[calc(100vh-73px)] min-h-[200px]`}
          id="map"
        >
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            <Button
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-md"
              size="icon"
            >
              <Layers className="h-5 w-5" />
            </Button>
            <Button
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-md"
              size="icon"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-md"
              size="icon"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
