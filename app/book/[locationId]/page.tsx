/* eslint-disable react-hooks/rules-of-hooks */
"use client";
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

type Prediction = {
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
  terms: { value: string }[];
};

type DistanceResponse = {
  rows: {
    elements: {
      distance: number; // Adjust if the type isn't a number
    }[];
  }[];
};

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Minus,
  Plus,
  Star,
  Clock,
  Wifi,
  CalendarPlus2Icon as CalendarIcon2,
  Camera,
  MapPin,
  Navigation,
  Package,
  Truck,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BagDetails {
  size: "small" | "medium" | "large";
  image: string | null;
}

interface TimeSlotPickerProps {
  availableSlots: string[];
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

const availableSlots: string[] = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  availableSlots,
  selectedTime,
  onTimeChange,
}) => {
  return (
    <Select value={selectedTime} onValueChange={onTimeChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {availableSlots.map((slot, index) => (
          <SelectItem key={index} value={slot}>
            {slot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const formatTime = (timeString: string): number => {
  const [hour, minutePart] = timeString.split(":");
  const [minute, period] = minutePart.split(" ");
  let hour24: number = Number.parseInt(hour, 10);

  if (period === "PM" && hour24 < 12) hour24 += 12;
  if (period === "AM" && hour24 === 12) hour24 = 0;

  return new Date().setHours(hour24, Number.parseInt(minute, 10), 0, 0);
};

const getNextAvailableTime = (slots: string[]): string | null => {
  const now: Date = new Date();
  let nextAvailableSlot: string | null = null;

  for (const slot of slots) {
    const slotTime: number = formatTime(slot);
    if (slotTime > now.getTime()) {
      nextAvailableSlot = slot;
      break;
    }
  }

  return nextAvailableSlot;
};

export default function BookingPage() {
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY || "";
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME || "";
  const cloudPreset = process.env.NEXT_PUBLIC_CLOUD_PRESET || "";
  const cloudLink = process.env.NEXT_PUBLIC_CLOUD_LINK || "";

  const token = Cookies.get("authToken");
  const [bookingType, setBookingType] = useState<"self" | "pickup">("self");
  const [dropOffDate, setDropOffDate] = useState<Date | undefined>();
  const [pickUpDate, setPickUpDate] = useState<Date | undefined>();
  const [isPickUpOpen, setIsPickUpOpen] = useState(false);
  const [isDropOffOpen, setIsDropOffOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [dropOffTime, setDropOffTime] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [bags, setBags] = useState<BagDetails[]>([
    { size: "small", image: null },
  ]);
  const [selectedPlan, setSelectedPlan] = useState<"daily" | "monthly">(
    "daily"
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const locationdata = searchParams ? searchParams.get("locationdata") : null;
  const locatio = locationdata ? JSON.parse(locationdata) : null;
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const [address, setAddress] = useState("");
  const [numberOfBags, setNumberOfBags] = useState(1);
  const [duration, setDuration] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [PickupCharge, setPickupCharge] = useState(0);
  const [Distance, setDistance] = useState(0);
  const calculateTotalPrice = useCallback(() => {
    const pickupCharge = bookingType === "pickup" ? PickupCharge : 0;
    console.log("ppp ", pickupCharge);

    const days =
      pickUpDate && dropOffDate
        ? Math.ceil(
            (pickUpDate.getTime() - dropOffDate.getTime()) / (1000 * 3600 * 24)
          )
        : 1;
    setDuration(days);
    if (selectedPlan === "daily") {
      const basePrice = numberOfBags * 100 * days; // ₹100 per bag per day
      return basePrice + pickupCharge;
    } else {
      const basePrice = bags.reduce((total, bag) => {
        switch (bag.size) {
          case "small":
            return total + Math.ceil(days / 30) * 500;
          case "medium":
            return total + Math.ceil(days / 30) * 750;
          case "large":
            return total + Math.ceil(days / 30) * 1000;
          default:
            return total;
        }
      }, 0);

      return basePrice + pickupCharge;
    }
  }, [
    selectedPlan,
    pickUpDate,
    dropOffDate,
    numberOfBags,
    bags,
    bookingType,
    PickupCharge,
  ]);

  if (!locatio) {
    return <p>Loading location details...</p>;
  }

  const handlePickupDateSelect = (date: Date | undefined) => {
    setPickUpDate(date);
    setIsPickUpOpen(false);
  };

  const handleDropDateSelect = (date: Date | undefined) => {
    if (pickUpDate && date && new Date(pickUpDate) < new Date(date)) {
      setPickUpDate(undefined);
    }
    setDropOffDate(date);
    setIsDropOffOpen(false);
  };

  const handleConfirmBooking = async () => {
    setError(null);
    if (!dropOffDate) {
      setError("Please select a drop-off date.");
      return;
    }

    if (
      bookingType === "pickup" ||
      (bookingType === "self" && selectedPlan === "monthly")
    ) {
      if (bags.some((bag) => !bag.image)) {
        setError("Please upload images for all bags.");
        return;
      }
    }

    if (bookingType === "pickup" && !location) {
      setError("Please provide your address for pickup.");
      return;
    }

    const payload = {
      bookingType,
      storeId: locatio._id,
      luggage:
        bookingType === "pickup" ||
        (bookingType === "self" && selectedPlan === "monthly")
          ? bags.map((bag) => ({
              size: bag.size,
              weight:
                bag.size === "small" ? 10 : bag.size === "medium" ? 15 : 20,
              image: bag.image,
            }))
          : { numberOfBags },
      duration,
      totalAmount: totalPrice,
      pickupDate: dropOffDate,
      returnDate: pickUpDate,
      pickupTime: dropOffTime,
      returnTime: pickupTime,
      address:
        bookingType === "pickup"
          ? { address: location, coordinates: coordinates }
          : null,
      selectedPlan,
    };

    console.log("payloadd  ", payload);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Booking confirmed:", await response.json());
        alert("Booking confirmed successfully!");
        router.push("/");
      } else {
        const errorData = await response.json();
        setError(
          `Failed to confirm booking: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error during booking:", error);
      setError(
        "An error occurred while confirming the booking. Please try again."
      );
    }
  };

  const handleAddBag = () => {
    setBags([...bags, { size: "small", image: null }]);
  };

  const handleRemoveBag = (index: number) => {
    const newBags = [...bags];
    newBags.splice(index, 1);
    setBags(newBags);
  };

  const handleBagSizeChange = (
    index: number,
    size: "small" | "medium" | "large"
  ) => {
    const newBags = [...bags];
    newBags[index].size = size;
    setBags(newBags);
  };

  const isDropOffDateDisabled = (date: Date) => {
    const today = new Date();
    return date < today;
  };

  const isPickUpDateDisabled = (date: Date): boolean => {
    const today = new Date();
    return date < today || (dropOffDate != null && date < dropOffDate);
  };

  const handleTimeChange = (time: string, type: "drop" | "pickup") => {
    if (type === "drop") {
      setDropOffTime(time);
    } else {
      setPickupTime(time);
    }
  };

  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(
          "File is too large. Please upload an image smaller than 10MB."
        );
        return;
      }

      setIsLoading(true);
      setUploadProgress((prev) => ({ ...prev, [index]: 0 }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudPreset);
      formData.append("cloud_name", cloudName);

      try {
        const response = await fetch(cloudLink, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
          const newBags = [...bags];
          newBags[index].image = data.secure_url;
          setBags(newBags);
        } else {
          setError("Error uploading image. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Error uploading image. Please try again.");
      } finally {
        setIsLoading(false);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[index];
          return newProgress;
        });
      }
    }
  };

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

  // const handleOutsideClick = () => {
  //   if (
  //     suggestionRef.current &&
  //     !suggestionRef.current.contains(event.target)
  //   ) {
  //     setShowSuggestions(false);
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleOutsideClick);
  //   return () => {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   };
  // }, []);
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

  const extractDistance = (response: DistanceResponse): number | null => {
    try {
      // Ensure the response has the expected structure
      if (
        response.rows &&
        response.rows.length > 0 &&
        response.rows[0].elements &&
        response.rows[0].elements.length > 0
      ) {
        // Extract the distance value
        const distance = response.rows[0].elements[0].distance;
        console.log("Distance (meters):", distance);

        // Optionally, convert to kilometers if needed
        const distanceInKm = distance / 1000;
        console.log("Distance (kilometers):", distanceInKm);

        return distanceInKm; // Return the distance in kilometers
      } else {
        console.error("Invalid response structure:", response);
        return null;
      }
    } catch (error) {
      console.error("Error extracting distance:", error);
      return null;
    }
  };
  function calculatePickupCharge(distance: number) {
    const baseFare = 181; // ₹181/km for 3-Wheeler
    const rate1to10 = 20.9; // ₹20.9/km for 1-10 km
    const rateAbove10 = 14.9; // ₹14.9/km for >10 km

    if (distance <= 0) {
      return 0; // No charge for non-positive distances
    }

    let totalCharge = baseFare;

    if (distance <= 10) {
      totalCharge += distance * rate1to10;
    } else {
      totalCharge += 10 * rate1to10; // Charge for the first 10 km
      totalCharge += (distance - 10) * rateAbove10; // Charge for remaining distance
    }

    return Math.ceil(totalCharge);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDistanceMatrix = async (
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number },
    apiKey: string
  ): Promise<number | null> => {
    try {
      const origins = `${origin.lat},${origin.lon}`;
      const destinations = `${destination.lat},${destination.lon}`;
      const url = `https://api.olamaps.io/routing/v1/distanceMatrix/basic?origins=${encodeURIComponent(
        origins
      )}&destinations=${encodeURIComponent(destinations)}&api_key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const distance = extractDistance(data); // Your helper function to extract distance

      return distance;
    } catch (error) {
      console.error("Error in fetchDistanceMatrix:", error);
      return null;
    }
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      // Set the location and clear suggestions first
      setLocation(suggestion.title);
      setShowSuggestions(false);
      setSuggestions([]);
      setError("");

      const origin = {
        lat: suggestion.location.lat,
        lon: suggestion.location.lon,
      };
      setCoordinates({
        latitude: suggestion.location.lat,
        longitude: suggestion.location.lon,
      });
      const destination = { lat: locatio.latitude, lon: locatio.longitude }; // Replace locatio with your actual state variable

      const distance = await fetchDistanceMatrix(origin, destination, apiKey);

      if (distance !== null) {
        console.log(`Distance: ${distance} km`);
        setDistance(distance);
        const charge = calculatePickupCharge(distance); // Your custom function for charge calculation
        setPickupCharge(charge);
      } else {
        console.error("Failed to calculate distance");
      }
    } catch (error) {
      console.error("Error handling suggestion click:", error);
      setError("Failed to handle suggestion. Please try again.");
    }
  };

  const fetchSuggestions = async (input: string) => {
    console.log("input ", input);

    if (!input) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // console.log("cooredin ", coordinates);

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
        // console.log("API Response:", data);

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
        console.log("sss ", suggestions);

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

  // import { useCallback } from "react";

  const handleLocateMe = useCallback(async () => {
    if (!coordinates) return;

    const { latitude, longitude } = coordinates;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();
      const address = data.display_name || "Address not found";
      setLocation(address);

      const origin = { lat: latitude, lon: longitude };
      const destination = { lat: locatio.latitude, lon: locatio.longitude }; // Replace locatio with your actual state variable

      const distance = await fetchDistanceMatrix(origin, destination, apiKey);

      if (distance !== null) {
        console.log(`Distance: ${distance} km`);
        setDistance(distance);
        const charge = calculatePickupCharge(distance); // Your custom function for charge calculation
        setPickupCharge(charge);
      } else {
        console.error("Failed to calculate distance");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation("Unable to retrieve address");
    }
  }, [
    coordinates,
    apiKey,
    fetchDistanceMatrix,
    locatio.latitude,
    locatio.longitude,
  ]); // Include dependencies here

  useEffect(() => {
    if (coordinates) handleLocateMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates]);

  useEffect(() => {
    const nextTime = getNextAvailableTime(availableSlots);
    if (nextTime) {
      setDropOffTime(nextTime);
      const nextHour = new Date(formatTime(nextTime));
      nextHour.setHours(nextHour.getHours() + 1);
      const pickupFormatted = format(nextHour, "h:mm a").toUpperCase();
      setPickupTime(pickupFormatted);
    }
  }, []);

  useEffect(() => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  }, [calculateTotalPrice]);

  // const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    getGeolocation();
  }, []);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-primary">
          Book Storage at {locatio.name}
        </h1>

        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-2xl">{locatio.name}</CardTitle>
            <CardDescription className="flex items-center text-base">
              <MapPin className="w-5 h-5 mr-2" />
              {locatio.address}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 mr-2" />
              <span className="font-medium mr-2 text-lg">4.6</span>
              <span className="text-muted-foreground">(653 reviews)</span>
            </div>
            <p className="text-muted-foreground mb-4 text-lg">200 m away</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                <Clock className="w-4 h-4 mr-2" />
                Open 24 hours
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                <CalendarIcon2 className="w-4 h-4 mr-2" />
                Multi-day storage
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
                <Wifi className="w-4 h-4 mr-2" />
                Wi-Fi available
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPlan}
              onValueChange={(value: "daily" | "monthly") =>
                setSelectedPlan(value)
              }
              className="grid grid-cols-2 gap-4"
            >
              <div
                className={cn(
                  "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-colors",
                  selectedPlan === "daily"
                    ? "border-primary bg-primary/5"
                    : "border-primary/20 hover:bg-primary/5"
                )}
              >
                <RadioGroupItem value="daily" id="daily" className="sr-only" />
                <Label htmlFor="daily" className="cursor-pointer text-center">
                  <div className="font-bold text-lg mb-1">Daily Plan</div>
                  <div className="text-sm text-muted-foreground">
                    ₹100/day per bag
                  </div>
                </Label>
              </div>
              <div
                className={cn(
                  "flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-colors",
                  selectedPlan === "monthly"
                    ? "border-primary bg-primary/5"
                    : "border-primary/20 hover:bg-primary/5"
                )}
              >
                <RadioGroupItem
                  value="monthly"
                  id="monthly"
                  className="sr-only"
                />
                <Label htmlFor="monthly" className="cursor-pointer text-center">
                  <div className="font-bold text-lg mb-1">Monthly Plan</div>
                  <div className="text-sm text-muted-foreground">
                    From ₹500/month per bag
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Booking Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={bookingType}
              onValueChange={(value: "self" | "pickup") =>
                setBookingType(value)
              }
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary/20 hover:bg-primary/5 transition-colors">
                <RadioGroupItem value="self" id="self" />
                <Label
                  htmlFor="self"
                  className="flex items-center cursor-pointer"
                >
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <span className="font-medium">Self Drop-off</span>
                    <p className="text-sm text-muted-foreground">
                      Bring your bags to our location
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary/20 hover:bg-primary/5 transition-colors">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label
                  htmlFor="pickup"
                  className="flex items-center cursor-pointer"
                >
                  <Truck className="w-5 h-5 mr-2 text-primary" />
                  <div>
                    <span className="font-medium">Schedule Pickup</span>
                    <p className="text-sm text-muted-foreground">
                      We'll come to your location
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Drop off
                </Label>
                <div className="flex gap-4">
                  <Popover open={isDropOffOpen} onOpenChange={setIsDropOffOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !dropOffDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dropOffDate ? (
                          format(dropOffDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dropOffDate}
                        onSelect={handleDropDateSelect}
                        initialFocus
                        disabled={isDropOffDateDisabled}
                      />
                    </PopoverContent>
                  </Popover>
                  <TimeSlotPicker
                    availableSlots={availableSlots}
                    selectedTime={dropOffTime}
                    onTimeChange={(time: string) =>
                      handleTimeChange(time, "drop")
                    }
                  />
                </div>
              </div>
              {/* {bookingType === "pickup" && ( */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Pick up
                </Label>
                <div className="flex gap-4">
                  <Popover open={isPickUpOpen} onOpenChange={setIsPickUpOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[200px] justify-start text-left font-normal",
                          !pickUpDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickUpDate ? (
                          format(pickUpDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={pickUpDate}
                        onSelect={handlePickupDateSelect}
                        initialFocus
                        disabled={isPickUpDateDisabled}
                      />
                    </PopoverContent>
                  </Popover>
                  <TimeSlotPicker
                    availableSlots={availableSlots}
                    selectedTime={pickupTime}
                    onTimeChange={(time: string) =>
                      handleTimeChange(time, "pickup")
                    }
                  />
                </div>
              </div>
            </div>

            {bookingType === "pickup" && (
              <>
                {/* <div className="mt-6">
                  <Label htmlFor="address">Pickup Address</Label>
                  <div className="flex mt-2">
                    <Textarea
                      id="address"
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={handleLocateUser}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div> */}
                <div className="space-y-4">
                  <Label>Pickup Address</Label>
                  <div className="relative flex">
                    {/* Left icon */}
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-black" />

                    {/* Input field */}
                    <Input
                      placeholder="Search your location"
                      value={location}
                      onChange={handleLocationChange}
                      onFocus={() => setShowSuggestions(true)}
                      className="pl-10 pr-10 h-12 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-gray-300 focus:border-primary focus:ring-primary"
                    />

                    {/* Loading Spinner */}
                    {isLoading && (
                      <div className="absolute inset-y-0 right-8 flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    )}

                    {/* Clear Icon */}
                    {location && (
                      <X
                        onClick={() => setLocation("")} // Clear the input value
                        className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500"
                      />
                    )}

                    {/* Right Icon (Locate Me) */}
                    {!location && (
                      <Navigation
                        onClick={handleLocateMe}
                        className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-primary"
                      />
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <Card
                        className="absolute z-20 w-full mt-12 shadow-lg max-h-[300px] overflow-hidden"
                        ref={suggestionRef}
                      >
                        <ScrollArea className="w-full max-h-72 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-grow text-left">
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
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-sm text-red-500 bg-white/80 backdrop-blur-sm p-1 rounded">
                      {error}
                    </p>
                  )}
                </div>
              </>
            )}

            {bookingType === "self" && (
              <div className="mt-6">
                <Label htmlFor="numberOfBags">Number of Bags</Label>
                <div className="flex items-center mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setNumberOfBags(Math.max(1, numberOfBags - 1))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="numberOfBags"
                    type="number"
                    value={numberOfBags}
                    onChange={(e) =>
                      setNumberOfBags(
                        Math.max(1, Number.parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-20 mx-2 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setNumberOfBags(numberOfBags + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(bookingType === "pickup" ||
          (bookingType === "self" && selectedPlan === "monthly")) && (
          <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Your Bags</CardTitle>
              <CardDescription>
                Upload photos and select sizes for your bags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {bags.map((bag, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <div
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className={cn(
                            "w-32 h-32 rounded-lg flex items-center justify-center cursor-pointer transition-all overflow-y-auto",
                            bag.image
                              ? "bg-white"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-dashed"
                          )}
                        >
                          {bag.image ? (
                            <Image
                              src={bag.image || "/placeholder.svg"}
                              alt={`Bag ${index + 1}`}
                              width={500}
                              height={500}
                              className="rounded-lg object-cover w-full h-full"
                            />
                          ) : uploadProgress[index] !== undefined ? (
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                              <span className="text-sm text-muted-foreground">
                                {uploadProgress[index]}%
                              </span>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Upload photo
                              </span>
                            </div>
                          )}
                        </div>
                        <Input
                          type="file"
                          ref={(el) => {
                            if (el) {
                              fileInputRefs.current[index] = el;
                            }
                          }}
                          className="hidden"
                          onChange={(e) => handleImageUpload(index, e)}
                          accept="image/*"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label className="text-base">Bag Size</Label>
                          <RadioGroup
                            value={bag.size}
                            onValueChange={(
                              value: "small" | "medium" | "large"
                            ) => handleBagSizeChange(index, value)}
                            className="flex gap-4 mt-2"
                          >
                            {[
                              { size: "small", weight: "Up to 10kg" },
                              { size: "medium", weight: "10-20kg" },
                              { size: "large", weight: "20-25kg" },
                            ].map(({ size, weight }) => (
                              <div
                                key={size}
                                className={cn(
                                  "flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                                  bag.size === size
                                    ? "border-primary bg-primary/5"
                                    : "border-transparent bg-gray-50 hover:bg-gray-100"
                                )}
                              >
                                <RadioGroupItem
                                  value={size}
                                  id={`size-${size}-${index}`}
                                  className="hidden"
                                />
                                <Label
                                  htmlFor={`size-${size}-${index}`}
                                  className="cursor-pointer text-center"
                                >
                                  <div className="font-medium capitalize mb-1">
                                    {size}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {weight}
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                      {bags.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBag(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleAddBag}
                  variant="outline"
                  className="w-full"
                >
                  Add another bag
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedPlan === "daily" ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">
                      Number of bags
                    </span>
                    <span>{numberOfBags}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">
                      Price per bag per day
                    </span>
                    <span>₹100</span>
                  </div>
                  {dropOffDate && pickUpDate && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">
                        Number of days
                      </span>
                      <span>
                        {Math.ceil(
                          (pickUpDate.getTime() - dropOffDate.getTime()) /
                            (1000 * 3600 * 24)
                        )}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">
                      Number of bags
                    </span>
                    <span>{bags.length}</span>
                  </div>
                  {bags.map((bag, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <span className="text-muted-foreground">
                        {bag.size} bag
                      </span>
                      <span>
                        ₹
                        {bag.size === "small"
                          ? "500"
                          : bag.size === "medium"
                          ? "750"
                          : "1000"}
                        /month
                      </span>
                    </div>
                  ))}
                  {dropOffDate && pickUpDate && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Months</span>
                      <span>{Math.ceil(duration / 30)}</span>
                    </div>
                  )}
                </>
              )}
              {bookingType === "pickup" && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Pickup Charge</span>
                  <span className="font-medium">
                    {` ₹${PickupCharge} (${Distance.toFixed(1)} km)  `}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total Price</span>
                <span>₹{totalPrice}</span>
              </div>
              {bookingType === "self" && selectedPlan === "daily" && (
                <p className="text-sm text-muted-foreground">
                  *Only the token amount of ₹100 will be charged now. The
                  remaining amount will be due at drop-off.
                </p>
              )}
              {bookingType === "self" && selectedPlan === "monthly" && (
                <p className="text-sm text-muted-foreground">
                  *The full amount will be charged upon drop-off and
                  verification of your bags.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleConfirmBooking}
          className="w-full h-12 text-lg mb-8 bg-primary hover:bg-primary/90 transition-colors duration-300"
          size="lg"
        >
          {bookingType === "self" && selectedPlan === "daily"
            ? `Reserve Slot (Pay ₹100 Token Amount)`
            : bookingType === "self" && selectedPlan === "monthly"
            ? "Reserve Slot (Pay ₹100 Token Amount)"
            : "Schedule Pickup"}
        </Button>

        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Pricing Information
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p>
                  <strong>Daily Plan:</strong> ₹100 per day for each bag.
                </p>
                <p>
                  <strong>Monthly Plan:</strong> Starting from ₹500 per month
                  for each bag, depending on the size:
                </p>
                <ul className="list-disc list-inside pl-4">
                  <li>Small bag: ₹500 per month</li>
                  <li>Medium bag: ₹750 per month</li>
                  <li>Large bag: ₹1000 per month</li>
                </ul>
                <p>
                  <strong>Pickup Service:</strong> Additional ₹50 charge for
                  pickup service.
                </p>
                <p>
                  <strong>Self Drop-off (Daily Plan):</strong> Only a ₹100 token
                  amount is charged initially.
                </p>
                <p>
                  <strong>Self Drop-off (Monthly Plan):</strong> Full amount
                  charged upon drop-off and verification.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
