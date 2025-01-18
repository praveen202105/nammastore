"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ZoomIn, ZoomOut, Layers, Star } from "lucide-react";
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY || "";
  const searchParams = useSearchParams();
  const location = searchParams?.get("location") || ""; // Read the "location" parameter
  console.log("llll  ", location);

  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const con = document.getElementById("map");
  useEffect(() => {
    // Get the container only once after the component mounts

    setContainer(con);
  }, [con]); // Empty dependency array ensures this runs only once

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // console.log("ccc", container);

    if (!coordinates || !container) return;
    import("@/sdk/OlaMapsWebSDKNew").then((module) => {
      const { OlaMaps } = module;
      // initialize and render map here

      const olaMaps = new OlaMaps({ apiKey });

      // Initialize the map
      const myMap = olaMaps.init({
        style:
          "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
        container: "map", // The ID of your map container
        //   center: [80.9462, 26.8467], // Default center
        zoom: 20,
      });

      // Calculate dynamic center
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

        return [coordinates.longitude, coordinates.latitude]; // Fallback to a default center
      };

      const calculatedCenter = calculateCenter();
      myMap.setCenter(calculatedCenter);

      // Iterate through the locations array and add a marker for each
      locations.forEach((location) => {
        const popup = // .setHTML(
          //   `<div style="color: black;"><strong>${location.name}</strong></div>`
          // ); // Styled text as black
          olaMaps.addPopup({ offset: [0, -30], anchor: "bottom" }) // Offset adjusted for popup above the marker
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

      // Center the map on the coordinates
      // myMap.setCenter([coordinates.longitude, coordinates.latitude]);
      // myMap.setCenter([80.9462, 26.8467]);
      myMap.setZoom(10);
    });
  }, [coordinates, container, apiKey, locations]);

  //   console.log("location ", locations);

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
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">Loading...</p>
      </div>
    );
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
    <div className="min-h-screen bg-[#f5f9fc]">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Tomorrow</span>
                <span className="px-2 py-1 bg-gray-100 rounded">2 bags</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                km / miles
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Side - Location List */}
        <div className="w-[450px] border-r bg-white overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Storage Locations in {location}
            </h2>
            <div className="space-y-4">
              {locations.map((loc) => (
                <Card
                  key={loc._id}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            // variant={loc.isOpen ? "success" : "secondary"}
                            className="rounded-full text-xs"
                          >
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
                      <div className="text-right">
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
          </div>
        </div>

        {/* Right Side - Map */}
        <div id="map" className="flex-1 relative">
          {/* <div id="mapContainer" className="w-full h-full"></div> */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              //   onClick={toggleMapStyle}
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-md"
              size="icon"
            >
              <Layers className="h-5 w-5" />
            </Button>
            <Button
              //   onClick={() => mapInstanceRef.current?.zoomIn()}
              onClick={() => {
                console.log("aaaa");
                //  mapInstanceRef.current?.zoomIn()
                // olaMapsRef.current?.on("zoomstart", () => {
                //   console.log("zoom called");
                // })
              }}
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-md"
              size="icon"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              //   onClick={() => mapInstanceRef.current?.zoomOut()}
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
