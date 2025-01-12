"use client";

import { useState, useRef, useEffect } from "react";

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
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface BagDetails {
  size: "small" | "medium" | "large";
  image: string | null;
}

export default function BookingPage({
  params,
}: {
  params: { locationId: string };
}) {
  //   console.log("store id", params.locationId);
  const router = useRouter();
  const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME || "";
  const cloudPreset = process.env.NEXT_PUBLIC_CLOUD_PRESET || "";
  const cloudLink = process.env.NEXT_PUBLIC_CLOUD_LINK || "";

  //   console.log("NAME ", cloudName);
  //   console.log("presett ", cloudPreset);
  const token = Cookies.get("authToken");
  const [dropOffDate, setDropOffDate] = useState<Date | undefined>();
  const [pickUpDate, setPickUpDate] = useState<Date | undefined>();
  const [isPickUpOpen, setIsPickUpOpen] = useState(false);
  const [isDropOffOpen, setIsDropOffOpen] = useState(false);

  const [bags, setBags] = useState<BagDetails[]>([
    { size: "small", image: null },
  ]);
  const [pricingType, setPricingType] = useState<"daily" | "monthly">("daily");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //   const searchParams = useSearchParams();
  const searchParams = useSearchParams();
  const locationdata = searchParams.get("locationdata"); // Retrieve the stringified location data
  const locatio = locationdata ? JSON.parse(locationdata) : null;

  console.log("Location Data: ", locatio);
  if (!locatio) {
    return <p>Loading location details...</p>;
  }

  const handlePickupDateSelect = (date: Date | undefined) => {
    setPickUpDate(date);
    setIsPickUpOpen(false); // Close the popover after date selection
  };

  const handleDropDateSelect = (date: Date | undefined) => {
    // If pickupDate is not null and is earlier than the selected dropOffDate, clear the dropOffDate
    if (pickUpDate && date && new Date(pickUpDate) < new Date(date)) {
      setPickUpDate(undefined); // Clear the dropOffDate if the condition is met
    }
    setDropOffDate(date); // Otherwise, set the dropOffDate

    setIsDropOffOpen(false); // Close the popover after date selection
  };

  const [error, setError] = useState<boolean[]>([]);
  const [dropError, setDropError] = useState<boolean>(false);
  const [pickupError, setPickupError] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [slotError, setSlotError] = useState<boolean>(false);

  const handleConfirmBooking = async () => {
    // Check if any bag is missing an image
    // const missingImageIndex = bags.findIndex((bag) => !bag.image);

    const errorStates = bags.map((bag) => !bag.image); // Check for missing images

    let hasError = false;

    if (errorStates.includes(true)) {
      console.log("dsds", errorStates);
      hasError = true;
      setError(errorStates);
    }
    // Validate pickupDate
    if (!pickUpDate) {
      setPickupError(true);
      hasError = true;
    } else {
      setPickupError(false);
    }

    // Validate dropOffDate
    if (!dropOffDate) {
      setDropError(true);
      hasError = true;
    } else {
      setDropError(false);
    }

    // Validate slot selection
    if (!selectedSlot) {
      setSlotError(true);
      hasError = true;
    } else {
      setSlotError(false);
    }

    setTimeout(() => {
      setError([]);
      setDropError(false);
      setPickupError(false);
      setSlotError(false);
    }, 3000);

    // If there's any error, stop submission
    if (hasError) {
      return;
    }

    // Proceed with the booking confirmation
    console.log("Booking confirmed", {
      //   locationId: params.locationId,
      dropOffDate,
      pickUpDate,
      bags,
      pricingType,
      selectedSlot,
    });
    const pickup = new Date(pickUpDate);
    const dropoff = new Date(dropOffDate);
    const duration = Math.ceil(
      (pickup.getTime() - dropoff.getTime()) / (1000 * 60 * 60 * 24)
    ); // Convert milliseconds to days

    const payload = {
      storeId: locatio._id, // Replace with the actual store ID
      luggage: {
        totalBags: bags.length,
        bags: bags.map((bag) => ({
          size: bag.size,
          weight: bag.size === "small" ? 10 : bag.size === "medium" ? 15 : 20, // Set weight based on size
          image: bag.image, // Include the image URL
        })),
      },
      duration,
      totalAmount: totalPrice, // Total price
      status: "confirmed", // Booking status
      pickupDate: pickUpDate,
      returnDate: dropOffDate,
      images: bags.map((bag) => bag.image), // Collect images
      slot: {
        date: selectedSlot,
        time: selectedSlot,
      },
    };
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} `, // Include the token here
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Booking confirmed:", await response.json());
        alert("Booking confirmed successfully!");
        router.push("/");
      } else {
        console.error("Booking failed:", await response.json());
        alert("Failed to confirm booking.");
      }
    } catch (error) {
      console.error("Error during booking:", error);
      alert("An error occurred while confirming the booking.");
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

  //   const handleImageUpload = (
  //     index: number,
  //     event: React.ChangeEvent<HTMLInputElement>
  //   ) => {
  //     const file = event.target.files?.[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const newBags = [...bags];
  //         newBags[index].image = reader.result as string;
  //         setBags(newBags);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }

      // Check if the file size exceeds the limit (e.g., 5MB)
      if (file.size > 10 * 1024 * 1024) {
        // 5MB
        alert("File is too large. Please upload an image smaller than 5MB.");
        return;
      }
      setIsLoading(true);

      // Resize the image before uploading (optional, but helpful for reducing size)
      const resizedImage = await resizeImage(file, 800); // Resize to a max width of 800px

      // Prepare the form data for Cloudinary
      const formData = new FormData();
      formData.append("file", resizedImage);
      formData.append("upload_preset", cloudPreset); // Replace with your Cloudinary upload preset
      formData.append("cloud_name", cloudName); // Replace with your Cloudinary cloud name

      try {
        // Upload the image to Cloudinary
        const response = await fetch(cloudLink, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
          // Successfully uploaded, now set the image URL in the bags state
          const newBags = [...bags];
          newBags[index].image = data.secure_url; // Get the secure URL of the uploaded image
          setBags(newBags);
        } else {
          console.error("Error uploading image", data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        // Set loading to false
        setIsLoading(false);
      }
    }
  };

  // Function to resize the image
  const resizeImage = (file: File, maxWidth: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onloadend = () => {
        if (reader.result) {
          img.src = reader.result as string;
        }
      };

      reader.readAsDataURL(file);

      img.onload = () => {
        // Calculate the new height based on the max width
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const scaleFactor = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleFactor;

          // Draw the resized image on the canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert the canvas to a Blob and resolve the promise
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Adjust quality here if needed, e.g., 0.8 for 80% quality
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                reject(new Error("Failed to resize image"));
              }
            },
            "image/jpeg",
            0.8 // Quality (80% quality)
          );
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    });
  };

  const [totalPrice, setTotalPrice] = useState(0); // State to store the total price

  const calculateTotalPrice = () => {
    if (pricingType === "daily") {
      return bags.length * 100;
    } else {
      return bags.reduce((total, bag) => {
        switch (bag.size) {
          case "small":
            return total + 500;
          case "medium":
            return total + 750;
          case "large":
            return total + 1000;
          default:
            return total;
        }
      }, 0);
    }
  };

  // Call this function whenever necessary to update the total price
  const updateTotalPrice = () => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  };

  // Example usage in a button click or effect

  useEffect(() => {
    updateTotalPrice();
  }, [bags, pricingType]);

  const isDropOffDateDisabled = (date: Date) => {
    // Disable dates before today
    const today = new Date();
    return date < today;
  };
  const isPickUpDateDisabled = (date: Date) => {
    // Disable dates before today or after DropOffDate
    const today = new Date();
    return date < today || (dropOffDate && date < dropOffDate);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Book Storage at {locatio.name}
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
            <span className="font-medium mr-2">4.6</span>
            <span className="text-muted-foreground">(653 reviews)</span>
          </div>
          <p className="text-lg mb-2">{locatio.address}</p>
          <p className="text-muted-foreground mb-4">200 m away</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {/* {location.amenities.map((amenity) => ( */}
            <span
              // key={amenity}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              Open 24 hour
              <Clock className="w-3 h-3 mr-1 ml-2" />
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Multi-day storage
              <CalendarIcon2 className="w-3 h-3 mr-1 ml-2" />
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Wi-Fi available
              <Wifi className="w-3 h-3 mr-1 ml-2" />
            </span>
            {/* ))} */}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Booking Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Drop off</label>
              <Popover open={isDropOffOpen} onOpenChange={setIsDropOffOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
              {dropError && (
                <p className="text-red-500 text-sm mt-2">
                  Drop Off date is required.
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Open {location.openTime}-{location.closeTime}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Pick up</label>
              <Popover open={isPickUpOpen} onOpenChange={setIsPickUpOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
                    // onSelect={setPickUpDate}
                    onSelect={handlePickupDateSelect}
                    initialFocus
                    disabled={isPickUpDateDisabled}
                  />
                </PopoverContent>
              </Popover>
              {pickupError && (
                <p className="text-red-500 text-sm mt-2">
                  Pickup date is required.
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Open {location.openTime}-{location.closeTime}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Slot
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
              >
                <option value="">Select a slot</option>
                {/* Example slot options, you can populate this dynamically */}
                <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                <option value="afternoon">
                  Afternoon (12:00 PM - 3:00 PM)
                </option>
                <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
              </select>
              {slotError && (
                <p className="text-red-500 text-sm mt-2">
                  Slot selection is required.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Bags</h2>
          {bags.map((bag, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => fileInputRefs.current[index]?.click()}
                >
                  {bag.image ? (
                    <img
                      src={bag.image}
                      alt={`Bag ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="text-center">
                        {!isLoading && (
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {!isLoading ? "Upload image" : "Uploading"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <Input
                  type="file"
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  className="hidden"
                  onChange={(e) => handleImageUpload(index, e)}
                  accept="image/*"
                />

                <div className="flex-grow">
                  <RadioGroup
                    value={bag.size}
                    onValueChange={(value: "small" | "medium" | "large") =>
                      handleBagSizeChange(index, value)
                    }
                    className="flex space-x-2"
                  >
                    {["small", "medium", "large"].map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}-${index}`}
                        />
                        <Label
                          htmlFor={`size-${size}-${index}`}
                          className="capitalize"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground mt-2">
                    {bag.size === "small"
                      ? "Up to 10kg"
                      : bag.size === "medium"
                      ? "10-20kg"
                      : "20-25kg"}
                  </p>
                </div>
                {bags.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveBag(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {/* Error message for missing image */}

              {error[index] && (
                <p className="text-red-500 text-sm mt-2">
                  Image is required for Bag {index + 1}.
                </p>
              )}
            </div>
          ))}

          <Button onClick={handleAddBag} className="w-full">
            Add Bag
          </Button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={pricingType === "daily" ? "default" : "outline"}
              className="w-full"
              onClick={() => setPricingType("daily")}
            >
              Daily pricing
            </Button>
            <Button
              variant={pricingType === "monthly" ? "default" : "outline"}
              className="w-full"
              onClick={() => setPricingType("monthly")}
            >
              Monthly pricing
            </Button>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Summary</h3>
              <button className="text-sm text-primary hover:underline">
                Have a promo code?
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Storage for {bags.length} bag(s)</span>
                <span>
                  {totalPrice} / {pricingType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service charge</span>
                <span>50</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{totalPrice + 50}</span>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleConfirmBooking}>
          Confirm booking
        </Button>
      </div>
    </div>
  );
}
