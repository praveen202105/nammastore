"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarIcon,
  Minus,
  Plus,
  Star,
  Camera,
  MapPin,
  Navigation,
  Package,
  Truck,
  Loader2,
  X,
  ShieldCheck,
  BadgeCheck,
  AlarmClock,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

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
      distance: number;
    }[];
  }[];
};

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
      <SelectTrigger className="w-full md:w-[180px]">
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
  const [selectedIndex, setSelectedIndex] = useState(0);
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
  const locatio = locationdata
    ? JSON.parse(locationdata)
    : {
        _id: "12345",
        name: "Storage Center",
        address: "123 Main St, New York, NY 10001",
        latitude: 40.7128,
        longitude: -74.006,
      };
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const calculateTotalPrice = useCallback(() => {
    const pickupCharge = bookingType === "pickup" ? PickupCharge : 0;

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

    if (!email || !phoneNumber || !firstName || !lastName) {
      setError("Please fill in all required fields.");
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
      customerInfo: {
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
      },
      receiveUpdates,
    };

    try {
      // Simulate API call
      setIsLoading(true);

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
        toast("Booking confirmed successfully!");
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
      setIsLoading(false);
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

      // Simulate file upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress((prev) => ({ ...prev, [index]: progress }));
        if (progress >= 100) {
          clearInterval(interval);

          // Use placeholder image instead of actual upload
          const newBags = [...bags];
          newBags[index].image = "/placeholder.svg";
          setBags(newBags);

          setIsLoading(false);
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
          });
        }
      }, 300);

      // In a real application, you would use this code:
      /*
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
      */
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
      // Mock suggestions
      const mockSuggestions: Suggestion[] = [
        {
          title: "Home",
          address: "123 Main St, New York, NY",
          distance: "1.2",
          location: { lat: 40.7128, lon: -74.006 },
          city: "New York",
        },
        {
          title: "Office",
          address: "456 Park Ave, New York, NY",
          distance: "2.5",
          location: { lat: 40.7641, lon: -73.9733 },
          city: "New York",
        },
        {
          title: "Central Park",
          address: "Central Park, New York, NY",
          distance: "3.4",
          location: { lat: 40.7851, lon: -73.9683 },
          city: "New York",
        },
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    }, 300);
  };

  const getGeolocation = useCallback(async () => {
    try {
      // Mock geolocation
      setCoordinates({
        latitude: 40.7128,
        longitude: -74.006,
      });
    } catch {
      setError("Failed to get geolocation.");
    }
  }, []);

  const extractDistance = (response: DistanceResponse): number | null => {
    try {
      if (
        response.rows &&
        response.rows.length > 0 &&
        response.rows[0].elements &&
        response.rows[0].elements.length > 0
      ) {
        const distance = response.rows[0].elements[0].distance;
        const distanceInKm = distance / 1000;
        return distanceInKm;
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
    const baseFare = 181;
    const rate1to10 = 20.9;
    const rateAbove10 = 14.9;

    if (distance <= 0) {
      return 0;
    }

    let totalCharge = baseFare;

    if (distance <= 10) {
      totalCharge += distance * rate1to10;
    } else {
      totalCharge += 10 * rate1to10;
      totalCharge += (distance - 10) * rateAbove10;
    }

    return Math.ceil(totalCharge);
  }

  const fetchDistanceMatrix = async (
    origin: { lat: number; lon: number },
    destination: { lat: number; lon: number },
    apiKey: string
  ): Promise<number | null> => {
    // Mock distance calculation
    return 3.5;
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      setLocation(suggestion.title + ", " + suggestion.address);
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
      const destination = { lat: locatio.latitude, lon: locatio.longitude };

      // Mock distance and charge
      const distance = 3.5;
      setDistance(distance);
      const charge = calculatePickupCharge(distance);
      setPickupCharge(charge);
    } catch (error) {
      console.error("Error handling suggestion click:", error);
      setError("Failed to handle suggestion. Please try again.");
    }
  };

  const handleLocateMe = useCallback(async () => {
    if (!coordinates) return;

    setLocation("Your Current Location, 123 Main St, New York, NY 10001");

    // Mock distance and charge
    const distance = 2.4;
    setDistance(distance);
    const charge = calculatePickupCharge(distance);
    setPickupCharge(charge);
  }, [coordinates]); // Removed calculatePickupCharge from dependencies

  useEffect(() => {
    if (coordinates) handleLocateMe();
  }, [coordinates, handleLocateMe]);

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

  useEffect(() => {
    getGeolocation();
  }, [getGeolocation]);

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!email || !phoneNumber) {
        setError("Please fill in all required contact details.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // For demo purposes
  const storageFacility = {
    name: locatio.name || "Manhattan Storage Center",
    address: locatio.address || "123 Broadway, New York, NY 10001",
    rating: 4.6,
    reviews: 128,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=60",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=60",
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4 px-2">
      <div className="container mx-auto max-w-6xl pr-5 py-8">
        {/* Checkout Progress */}
        <div className="flex justify-center items-center mb-8 border-b pb-4 text-center sm:text-left">
          {/* Step 1 */}
          <div
            className={`flex items-center ${
              currentStep >= 1 ? "text-primary" : "text-gray-400"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300"
              } mr-2`}
            >
              1
            </div>
            <span className="font-medium text-sm sm:text-base">
              Contact Detail
            </span>
          </div>

          {/* Arrow 1 (Visible on mobile) */}
          <div
            className={`w-full sm:w-10 h-px my-2 sm:my-0 mx-2 ${
              currentStep >= 2 ? "bg-primary" : "bg-gray-300"
            }`}
          />

          {/* Step 2 */}
          <div
            className={`flex items-center ${
              currentStep >= 2 ? "text-primary" : "text-gray-400"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 2
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300"
              } mr-2`}
            >
              2
            </div>
            <span className="font-medium text-sm sm:text-base">
              Booking Detail
            </span>
          </div>

          {/* Arrow 2 (Visible on mobile) */}
          <div
            className={`w-full sm:w-10 h-px my-2 sm:my-0 mx-2 ${
              currentStep >= 3 ? "bg-primary" : "bg-gray-300"
            }`}
          />

          {/* Step 3 */}
          <div
            className={`flex items-center ${
              currentStep >= 3 ? "text-primary" : "text-gray-400"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 3
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300"
              } mr-2`}
            >
              3
            </div>
            <span className="font-medium text-sm sm:text-base">
              Review Order
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h1 className="text-2xl font-bold mb-6">Secure Checkout</h1>
              <div className="p-3 bg-green-50 text-green-800 rounded-md flex items-center mb-6">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Checkout securely - it takes only a few minutes
              </div>

              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-4">Contact Detail</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="email">Alternative Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="mt-1"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="mt-1"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <Checkbox
                      id="updates"
                      checked={receiveUpdates}
                      onCheckedChange={(checked: boolean) =>
                        setReceiveUpdates(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="updates"
                      className="ml-2 text-sm text-gray-600"
                    >
                      Receive text message updates about your booking. Message
                      rates may apply.
                    </Label>
                  </div>

                  <h2 className="text-xl font-bold mb-4">Traveler Detail</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        className="mt-1"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        className="mt-1"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your address"
                      className="mt-1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="promoCode">Promo Code</Label>
                    <div className="flex mt-1">
                      <Input
                        id="promoCode"
                        type="text"
                        placeholder="Enter promo code"
                        className="rounded-r-none"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button type="button" className="rounded-l-none">
                        Apply
                      </Button>
                    </div>
                    <div className="text-right mt-1">
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline"
                      >
                        Find promo code?
                      </a>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-4">Booking Detail</h2>

                  <Card className="mb-6 hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="text-lg">
                        Choose Your Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
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
                          <RadioGroupItem
                            value="daily"
                            id="daily"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="daily"
                            className="cursor-pointer text-center"
                          >
                            <div className="font-bold text-lg mb-1">
                              Daily Plan
                            </div>
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
                          <Label
                            htmlFor="monthly"
                            className="cursor-pointer text-center"
                          >
                            <div className="font-bold text-lg mb-1">
                              Monthly Plan
                            </div>
                            <div className="text-sm text-muted-foreground">
                              From ₹500/month per bag
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card className="mb-6 hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="text-lg">Booking Type</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
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
                              <span className="font-medium">
                                Schedule Pickup
                              </span>
                              <p className="text-sm text-muted-foreground">
                                \ We'll come to your location
                              </p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card className="mb-6 hover:shadow-md transition-shadow">
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="text-lg">
                        Schedule Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Drop off
                          </Label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Popover
                              open={isDropOffOpen}
                              onOpenChange={setIsDropOffOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full sm:w-[200px] justify-start text-left font-normal",
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
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
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Pick up
                          </Label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Popover
                              open={isPickUpOpen}
                              onOpenChange={setIsPickUpOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full sm:w-[200px] justify-start text-left font-normal",
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
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
                        <div className="mt-6">
                          <Label>Pickup Address</Label>
                          <div className="relative flex mt-2">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-black" />

                            <Input
                              placeholder="Search your location"
                              value={location}
                              onChange={handleLocationChange}
                              onFocus={() => setShowSuggestions(true)}
                              className="pl-10 pr-10 h-12 bg-white/90 text-gray-800 placeholder-gray-500"
                            />

                            {isLoading && (
                              <div className="absolute inset-y-0 right-8 flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                              </div>
                            )}

                            {location && (
                              <X
                                onClick={() => setLocation("")}
                                className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500"
                              />
                            )}

                            {!location && (
                              <Navigation
                                onClick={handleLocateMe}
                                className="absolute right-3 top-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-primary"
                              />
                            )}

                            {showSuggestions && suggestions.length > 0 && (
                              <Card
                                className="absolute z-20 w-full mt-12 shadow-lg max-h-[300px] overflow-hidden"
                                ref={suggestionRef}
                              >
                                <ScrollArea className="w-full max-h-72 overflow-y-auto">
                                  {suggestions.map((suggestion, index) => (
                                    <div
                                      key={index}
                                      className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                                      onClick={() =>
                                        handleSuggestionClick(suggestion)
                                      }
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
                        </div>
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
                                  Math.max(
                                    1,
                                    Number.parseInt(e.target.value) || 1
                                  )
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
                    <Card className="mb-6 hover:shadow-md transition-shadow">
                      <CardHeader className="bg-primary/5">
                        <CardTitle className="text-lg">Your Bags</CardTitle>
                        <CardDescription>
                          Upload photos and select sizes for your bags
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-6">
                          {bags.map((bag, index) => (
                            <div
                              key={index}
                              className="p-4 border rounded-lg bg-white shadow-sm"
                            >
                              <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="relative">
                                  <div
                                    onClick={() =>
                                      fileInputRefs.current[index]?.click()
                                    }
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
                                    onChange={(e) =>
                                      handleImageUpload(index, e)
                                    }
                                    accept="image/*"
                                  />
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <Label className="text-base">
                                      Bag Size
                                    </Label>
                                    <RadioGroup
                                      value={bag.size}
                                      onValueChange={(
                                        value: "small" | "medium" | "large"
                                      ) => handleBagSizeChange(index, value)}
                                      className="flex flex-wrap gap-4 mt-2"
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
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h2 className="text-xl font-bold mb-4">Review Your Order</h2>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p>{phoneNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p>
                            {firstName} {lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p>{address || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">
                        Storage Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Location</p>
                          <p>{storageFacility.name}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Plan</p>
                          <p>
                            {selectedPlan === "daily"
                              ? "Daily Plan"
                              : "Monthly Plan"}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Booking Type</p>
                          <p>
                            {bookingType === "self"
                              ? "Self Drop-off"
                              : "Pickup Service"}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Drop-off</p>
                          <p>
                            {dropOffDate
                              ? format(dropOffDate, "PPP")
                              : "Not selected"}{" "}
                            at {dropOffTime}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Pick-up</p>
                          <p>
                            {pickUpDate
                              ? format(pickUpDate, "PPP")
                              : "Not selected"}{" "}
                            at {pickupTime}
                          </p>
                        </div>
                        {bookingType === "pickup" && (
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500">
                              Pickup Address
                            </p>
                            <p>{location}</p>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">Bags</p>
                          <p>
                            {bookingType === "self" && selectedPlan === "daily"
                              ? `${numberOfBags} bag(s)`
                              : `${bags.length} bag(s) (${bags
                                  .map((b) => b.size)
                                  .join(", ")})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex-1 sm:flex-initial"
                  >
                    Back
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    onClick={goToNextStep}
                    className="flex-1 sm:flex-initial"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfirmBooking}
                    className="flex-1 sm:flex-initial"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="mb-4">
                <div className="aspect-w-16 aspect-h-9 mb-3 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 gap-1">
                    {storageFacility.images.map((img, i) => (
                      <div
                        key={i}
                        className={i === selectedIndex ? "col-span-3" : ""}
                        onClick={() => setSelectedIndex(i)}
                      >
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`${storageFacility.name} ${i + 1}`}
                          width={400}
                          height={i === 0 ? 200 : 100}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-lg">{storageFacility.name}</h3>
                <div className="flex items-center mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium mr-1">
                    {storageFacility.rating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({storageFacility.reviews} reviews)
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" /> {storageFacility.address}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Drop-off Date</span>
                  <span>
                    {dropOffDate
                      ? format(dropOffDate, "MMM dd, yyyy")
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pick-up Date</span>
                  <span>
                    {pickUpDate
                      ? format(pickUpDate, "MMM dd, yyyy")
                      : "Not selected"}
                  </span>
                </div>
                {dropOffDate && pickUpDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span>{duration} days</span>
                  </div>
                )}
                {selectedPlan === "daily" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Number of bags</span>
                      <span>{numberOfBags}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Price per bag per day
                      </span>
                      <span>₹100</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Number of bags</span>
                      <span>{bags.length}</span>
                    </div>
                    {bags.map((bag, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-500">{bag.size} bag</span>
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
                  </>
                )}
                {bookingType === "pickup" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pickup Charge</span>
                    <span>
                      ₹{PickupCharge} ({Distance.toFixed(1)} km)
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking fee</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{totalPrice + 50}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Book with confidence</h3>

                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Lowest price guarantee</p>
                    <p className="text-sm text-gray-500">
                      Find it cheaper? We'll refund the difference
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Privacy protection</p>
                    <p className="text-sm text-gray-500">
                      We use SSL encryption to keep your data secure
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlarmClock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">24/7 global support</p>
                    <p className="text-sm text-gray-500">
                      Get the answers you need, when you need them
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
