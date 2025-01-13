"use client";

import { Building2, Clock, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

import Cookies from "js-cookie";
export default function CreateStore() {
  const token = Cookies.get("authToken");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    ownerName: "",
    timings: "",
    isOpen: true,
    pricePerDay: 10,
    pricePerMonth: {
      small: 0,
      medium: 0,
      large: 0,
    },
    capacity: 0,
    contactNumber: "",
    description: "",
  });

  const handleChange = (e: {
    target: { id: string; value: string | number };
  }) => {
    const { id, value } = e.target;

    // Handle nested object updates for pricePerMonth
    if (["small", "medium", "large"].includes(id)) {
      setFormData((prev) => ({
        ...prev,
        pricePerMonth: {
          ...prev.pricePerMonth,
          [id]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("fffff ", formData);

      const response = await fetch("/api/store/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Store created successfully!");
        setFormData({
          name: "",
          address: "",
          city: "",
          pincode: "",
          ownerName: "",
          timings: "",
          isOpen: true,
          pricePerDay: 10,
          pricePerMonth: {
            small: 0,
            medium: 0,
            large: 0,
          },
          capacity: 0,
          contactNumber: "",
          description: "",
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to create store:", error);
      alert("Failed to create store.");
    }
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            Create New Storage Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <Building2 className="h-5 w-5" />
              <h3>Basic Information</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner Name</Label>
                <Input
                  id="owner"
                  value={formData.ownerName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <MapPin className="h-5 w-5" />
              <h3>Location Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Operating Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <Clock className="h-5 w-5" />
              <h3>Operating Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timings">Operating Hours</Label>
                <Input
                  id="timings"
                  value={formData.timings}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Storage Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <User className="h-5 w-5" />
              <h3>Pricing Details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Price Per Day ($)</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="smallPrice">Small Locker ($/month)</Label>
                <Input
                  id="small"
                  type="number"
                  value={formData.pricePerMonth.small}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediumPrice">Medium Locker ($/month)</Label>
                <Input
                  id="medium"
                  type="number"
                  value={formData.pricePerMonth.medium}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="largePrice">Large Locker ($/month)</Label>
                <Input
                  id="large"
                  type="number"
                  value={formData.pricePerMonth.large}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            onClick={handleSubmit}
          >
            Create Store
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
