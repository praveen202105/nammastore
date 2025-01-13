"use client";

// import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
// import type { StorageLocation } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

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
}

// Location type you received from the API
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
  // other properties from the API
}

// Example data from API - replace with actual API call
// const LOCATION_DATA: StorageLocation = {
//   _id: "677a1e3f97aaff83538d60b4",
//   name: "City Luggage Storage",
//   address: "123 Main St, Downtown",
//   city: "Metropolis",
//   pincode: "12345",
//   ownerName: "John Doe",
//   timings: "9:00 AM - 9:00 PM",
//   isOpen: true,
//   pricePerDay: 10,
//   pricePerMonth: {
//     small: 100,
//     medium: 150,
//     large: 200,
//   },
//   capacity: 6,
//   contactNumber: "+1-234-567-8901",
//   description: "Safe and secure luggage storage with 24/7 monitoring.",
//   createdAt: "2025-01-05T05:53:03.722Z",
//   updatedAt: "2025-01-11T13:24:44.356Z",
// };
interface Data {
  locations?: Location[]; // locations can be undefined or an array of Location objects
}

export default function SearchPage() {
  //   const searchParams = useSearchParams();
  const [locations, setLocations] = useState<StorageLocation[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const transformToStorageLocation = (location: Location): StorageLocation => {
    return {
      _id: location._id, // Add logic to handle or generate _id
      name: location.name,
      address: location.address,
      city: location.city,
      pincode: location.pincode, // Add default or logic to handle
      ownerName: location.ownerName, // Add logic to handle
      timings: location.timings,
      isOpen: location.isOpen,
      pricePerDay: location.pricePerDay,
      pricePerMonth: { small: 0, medium: 0, large: 0 }, // Set default or handle
      capacity: location.capacity,
      contactNumber: location.contactNumber, // Add logic to handle
      description: location.description, // Add logic to handle
      createdAt: new Date().toISOString(), // Handle properly
      updatedAt: new Date().toISOString(), // Handle properly
    };
  };
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      throw new Error("Token not found in cookies");
    }
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Replace this URL with your actual API endpoint
        // const response = await fetch("/api/store/getAllstore");
        const response = await fetch("/api/store/getAllstore", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        // const data: StorageLocation[] = await response.json();
        const data: Data = await response.json(); // Or however you get your data

        if (data.locations) {
          // Transform the locations data
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
  }, []);

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
  console.log("lllll ", locations);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Available Storage Locations</h1>
      <div className="grid gap-6">
        {locations.map((location) => (
          <Card
            key={location._id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{location.name}</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <p className="text-muted-foreground">
                      {location.address}, {location.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {location.timings}
                    </span>
                    <Badge
                    //   variant={location.isOpen ? "success" : "destructive"}
                    >
                      {location.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
                <div className="md:text-right space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${location.pricePerDay}/day
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Starting from
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {location.capacity} spots available
                    </p>
                  </div>
                  {/* <Button className="w-full md:w-auto" asChild>
                    <Link href={`/book/${location._id}`}>Book now</Link>
                  </Button> */}

                  <Button className="w-full md:w-auto" asChild>
                    <Link
                      href={{
                        pathname: `/book/${location._id}`,
                        query: { locationdata: JSON.stringify(location) }, // Correct stringification
                      }}
                    >
                      Book now
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
