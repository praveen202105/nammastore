"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Building2,
  Phone,
  Mail,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  pincode: z.string().min(6, "Pincode must be 6 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  timings: z.string(),
  isOpen: z.boolean(),
  pricePerDay: z.number().min(0, "Price must be positive"),
  pricePerMonth: z.object({
    small: z.number(),
    medium: z.number(),
    large: z.number(),
  }),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  images: z.array(z.string()),
  latitude: z.number(),
  longitude: z.number(),
  amenities: z.array(z.string()),
});

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

export default function CreateStorePage() {
  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY || "";
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const token = Cookies.get("authToken");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      pincode: "",
      ownerName: "",
      timings: "9:00 AM - 9:00 PM",
      isOpen: true,
      pricePerDay: 0,
      pricePerMonth: {
        small: 0,
        medium: 0,
        large: 0,
      },
      capacity: 0,
      contactNumber: "",
      description: "",
      email: "",
      images: [],
      latitude: 0,
      longitude: 0,
      amenities: [],
    },
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        setError(
          "Unable to get your current location. Please enter it manually."
        );
      }
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
        console.log("API Response:", data);

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

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // console.log("pincode  ", suggestion);

    setLocation(suggestion.title);
    form.setValue("address", suggestion.address);
    form.setValue("city", suggestion.city);
    form.setValue("latitude", suggestion.location.lat);
    form.setValue("longitude", suggestion.location.lon);
    setShowSuggestions(false);
    setSuggestions([]);
    setError("");
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("vvv ", values);

      setIsSubmitting(true);
      const response = await fetch("/api/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create store");
      }

      router.push("/");
    } catch (error) {
      console.error("Error creating store:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity && !amenities.includes(newAmenity)) {
      setAmenities([...amenities, newAmenity]);
      form.setValue("amenities", [...amenities, newAmenity]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    const updatedAmenities = amenities.filter((a) => a !== amenity);
    setAmenities(updatedAmenities);
    form.setValue("amenities", updatedAmenities);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Storage Location
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to list your storage space
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={cn(
                      "h-1 w-12 mx-2",
                      currentStep > step ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details about your storage location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              className="pl-9"
                              placeholder="Enter store name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Location</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search for a location"
                        value={location}
                        onChange={handleLocationChange}
                        onFocus={() => setShowSuggestions(true)}
                        className="pl-10 h-12 bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-gray-300 focus:border-primary focus:ring-primary"
                      />

                      {isLoading && (
                        <div className="absolute inset-y-0 right-3 flex items-center">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                      <Card
                        className="absolute z-10 w-full mt-1 shadow-lg max-h-[300px] overflow-hidden"
                        ref={suggestionRef}
                      >
                        <ScrollArea className="w-full">
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

                    {error && (
                      <p className="text-sm text-red-500 bg-white/80 backdrop-blur-sm p-1 rounded">
                        {error}
                      </p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Full address"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your storage facility..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Capacity</CardTitle>
                  <CardDescription>
                    Set your pricing structure and storage capacity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pricePerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Day (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter daily price"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Monthly Prices</FormLabel>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="pricePerMonth.small"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Small</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Small"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pricePerMonth.medium"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medium</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Medium"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pricePerMonth.large"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Large</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Large"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter total capacity"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact & Additional Details</CardTitle>
                  <CardDescription>
                    Provide contact information and additional features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter owner name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                className="pl-9"
                                placeholder="Enter contact number"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                className="pl-9"
                                placeholder="Enter email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="timings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operating Hours</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              className="pl-9"
                              placeholder="e.g., 9:00 AM - 9:00 PM"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isOpen"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Currently Open
                          </FormLabel>
                          <FormDescription>
                            Toggle if your storage facility is currently
                            accepting bookings
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Amenities</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add an amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={addAmenity}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {amenity}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeAmenity(amenity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Store"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
