"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/store/userContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [picture, setPicture] = useState(user?.profilePic || "");
  const [isEditing, setIsEditing] = useState(false);
  console.log("dsds ", user);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPicture(user.profilePic);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      // Implement your update profile logic here
      // For example:
      // const response = await axios.put("/api/user/profile", { name, email, picture });
      // const updatedUser = response.data;

      // Simulating a successful update for demonstration
      const updatedUser = { ...user, name, email, profilePic: picture };
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-[350px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Profile" : "Profile"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            {/* <Image
              src={picture}
              alt={name}
              width={100}
              height={100}
              className="rounded-full"
            /> */}
            <img src={picture} alt="Profile" />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          {isEditing && (
            <div>
              <Label htmlFor="picture">Profile Picture URL</Label>
              <Input
                id="picture"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isEditing ? (
          <>
            <Button onClick={handleSave} className="mr-2">
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </CardFooter>
    </Card>
  );
}
