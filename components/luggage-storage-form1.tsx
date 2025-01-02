"use client";

import { useEffect, useState } from "react";
import {
  format,
  differenceInDays,
  differenceInMonths,
  addMonths,
} from "date-fns";
import { CalendarIcon, Minus, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
interface LuggageStorageFormProps {
  selectedBag: string;
}
interface LuggageItem {
  size: "small" | "medium" | "large";
  count: number;
}
type PriceDistribution = {
  items: {
    size: string;
    count: number;
    pricePerMonth: number;
    totalPrice: number;
  }[];
  pickupFee: number;
  total: number;
};
export function LuggageStorageForm({ selectedBag }: LuggageStorageFormProps) {
  console.log("sss", selectedBag);

  const [images, setImages] = useState<File[]>([]);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  );
  const [selectedPickupTime, setSelectedPickupTime] = useState<
    string | undefined
  >(undefined);
  const [luggage, setLuggage] = useState<LuggageItem[]>([
    { size: "small", count: selectedBag === "Small" ? 1 : 0 },
    { size: "medium", count: selectedBag === "Medium" ? 1 : 0 },
    { size: "large", count: selectedBag === "Large" ? 1 : 0 },
  ]);

  const locations = [
    { name: "Downtown Storage", distance: 2.5 },
    { name: "Suburb Safe", distance: 5.1 },
    { name: "Central Lockers", distance: 1.8 },
  ];
  const [priceDistribution, setPriceDistribution] =
    useState<PriceDistribution | null>(null);

  const form = useForm({
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      deliveryOption: "self",
    },
  });

  const onSubmit = (data: any) => {
    console.log({
      ...data,
      selectedLocation,
      selectedPickupTime,
      images,
    });
    // Here you would typically send this data to your backend
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log("fff", files);

    if (files) {
      const uploadedFiles = Array.from(files);
      if (uploadedFiles.length + images.length > 4) {
        return; // Validation will show the error.
      }
      const updatedImages = [...images, ...uploadedFiles];
      setImages(updatedImages);
    }
  };

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  const handleLuggageChange = (
    size: "small" | "medium" | "large",
    increment: boolean
  ) => {
    setLuggage((prevLuggage) =>
      prevLuggage.map((item) =>
        item.size === size
          ? {
              ...item,
              count: increment ? item.count + 1 : Math.max(0, item.count - 1),
            }
          : item
      )
    );
  };

  const calculateDuration = () => {
    if (startDate && endDate) {
      const totalMonths = differenceInMonths(endDate, startDate);
      const remainingDays = differenceInDays(
        endDate,
        addMonths(startDate, totalMonths)
      );
      return { totalMonths, remainingDays };
    }
    return null;
  };

  const duration = calculateDuration();

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i += 2) {
      const start = i.toString().padStart(2, "0") + ":00";
      const end = ((i + 2) % 24).toString().padStart(2, "0") + ":00";
      slots.push(`${start} - ${end}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const date = new Date(startDate);

  // Extract the month and day as integers
  const month = date.toLocaleString("en-US", { month: "short" }); // "Jan"
  const day = date.getDate(); // 2

  // Combine into the desired format
  const formattedDate = `${month} ${day}`;

  const calculatePriceDistribution = () => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const deliveryOption = form.watch("deliveryOption");

    if (startDate && endDate) {
      const months = differenceInMonths(endDate, startDate) + 1; // Include the current month

      const distribution = luggage
        .map((item) => {
          const pricePerMonth =
            item.size === "small" ? 500 : item.size === "medium" ? 750 : 1000;
          const totalPrice = pricePerMonth * item.count * months;
          return {
            size: item.size.charAt(0).toUpperCase() + item.size.slice(1), // Capitalizing the size
            count: item.count,
            pricePerMonth,
            totalPrice,
          };
        })
        .filter((item) => item.count > 0);

      const pickupFee = deliveryOption === "pickup" ? 200 : 0;

      return {
        items: distribution,
        pickupFee,
        total:
          distribution.reduce((sum, item) => sum + item.totalPrice, 0) +
          pickupFee,
      };
    }

    return null;
  };

  useEffect(() => {
    setPriceDistribution(calculatePriceDistribution());
  }, [
    form.watch("startDate"),
    form.watch("endDate"),
    form.watch("deliveryOption"),
    luggage,
  ]);

  return (
    <ScrollArea className="h-[90vh] rounded-md border p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Select Luggage Size and Quantity
            </h3>
            <div className="flex flex-wrap gap-4">
              {luggage.map((item) => (
                <div key={item.size} className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLuggageChange(item.size, false)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-20 text-center">
                    {item.size.charAt(0).toUpperCase() + item.size.slice(1)}:{" "}
                    {item.count}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLuggageChange(item.size, true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover
                    open={startDatePopoverOpen}
                    onOpenChange={setStartDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[180px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date: any) => {
                          field.onChange(date);
                          setStartDatePopoverOpen(false); // Close the popover after selecting a date
                        }}
                        disabled={
                          (date: number) =>
                            date < Date.now() ||
                            date < new Date("1900-01-01").getTime() // Convert the 1900 date to a timestamp
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover
                    open={endDatePopoverOpen}
                    onOpenChange={setEndDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[180px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date: any) => {
                          field.onChange(date);
                          setEndDatePopoverOpen(false); // Close the popover after selecting a date
                        }}
                        disabled={(date: any) => {
                          const startDate = form.watch("startDate");
                          const startDateTimestamp = startDate
                            ? new Date(startDate).getTime()
                            : 0;
                          return (
                            date <= startDateTimestamp ||
                            date < new Date("1900-01-01").getTime()
                          );
                        }}
                        defaultMonth={field.value || new Date()} // Opens to the selected date's month or current month
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4 flex justify-between">
            <h3>Total Duration</h3>
            <p>
              {duration
                ? duration.totalMonths > 0
                  ? `${duration.totalMonths} month${
                      duration.totalMonths !== 1 ? "s" : ""
                    } and ${duration.remainingDays} day${
                      duration.remainingDays !== 1 ? "s" : ""
                    }`
                  : `${duration.remainingDays} day${
                      duration.remainingDays !== 1 ? "s" : ""
                    }`
                : "Select both dates to see the duration."}
            </p>
          </div>

          <FormField
            control={form.control}
            name="deliveryOption"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Delivery Option</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="self" />
                      </FormControl>
                      <div className="flex-col w-full  justify-between ">
                        <div>
                          <FormLabel className="font-normal">
                            Self drop to our agent
                          </FormLabel>
                        </div>
                        <div>
                          {field.value === "self" && (
                            <Select onValueChange={setSelectedLocation}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem
                                    key={location.name}
                                    value={location.name}
                                  >
                                    {location.name} ({location.distance} km
                                    away)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pickup" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Schedule pickup (chargeable)
                      </FormLabel>
                      {field.value === "pickup" && (
                        <Select
                          onValueChange={setSelectedPickupTime}
                          value={selectedPickupTime}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select pickup time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {formattedDate + " " + slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Upload Luggage Images</FormLabel>
            <FormControl>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </FormControl>
            <FormDescription>
              Upload images of your luggage for our reference.
            </FormDescription>
            {images.length > 0 && (
              <div className="mt-4 max-h-[300px] overflow-y-auto grid grid-cols-4 gap-1">
                {images.map((image, index) => (
                  <div key={index} className="relative group w-20">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded ${index}`}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 h-12 rounded-r-lg opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>

          {priceDistribution && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Price Summary</h4>
              <div className="space-y-2">
                {priceDistribution.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span>
                      {item.count} x {item.size} Luggage (₹{item.pricePerMonth}
                      /month each)
                    </span>
                    <span>₹{item.totalPrice}</span>
                  </div>
                ))}
                {priceDistribution.pickupFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Pickup fee</span>
                    <span>₹{priceDistribution.pickupFee}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>₹{priceDistribution.total}</span>
                </div>
              </div>
            </div>
          )}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </ScrollArea>
  );
}
