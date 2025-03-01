"use client";
import EnquiryForm from "@/components/enquire-form";
import { FloatingButtonExample } from "@/components/floating-button-ui";
import { SearchForm } from "@/components/search-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Carousel from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Typewriter } from "@/components/ui/typewriter";
import {
  ClipboardCheck,
  HardHat,
  Shield,
  Star,
  Menu,
  MapPin,
  Clock,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const slideData = [
  {
    title: "Central Station Storage",
    button: "Book Now",
    src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Airport Luggage Locker",
    button: "Book Now",
    src: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Downtown Baggage Hub",
    button: "Book Now",
    src: "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Tourist Center Storage",
    button: "Book Now",
    src: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Luggage storage locations by city
const luggageStoreData = [
  {
    name: "Bengaluru",
    image:
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    locations: 12,
    price: "₹49/day",
  },
  {
    name: "Delhi",
    image:
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    locations: 18,
    price: "₹59/day",
  },
  {
    name: "Chennai",
    image:
      "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    locations: 9,
    price: "₹45/day",
  },
  {
    name: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    locations: 22,
    price: "₹65/day",
  },
  {
    name: "Hyderabad",
    image:
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    locations: 8,
    price: "₹49/day",
  },
  {
    name: "Pune",
    image:
      "https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    locations: 6,
    price: "₹45/day",
  },
];
export default function Home() {
  const router = useRouter();

  return (
    <div>
      <main>
        {/* Hero Section */}
        <div className="relative mt-8">
          {/* Carousel Component */}
          <Carousel slides={slideData} />

          {/* SearchForm Overlay */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center  p-4">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="w-full">
                <SearchForm />
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-4 right-4 z-50">
          <FloatingButtonExample />
        </div>
        {/* Luggage Store Locations Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a237e] text-center mb-12">
              LUGGAGE STORAGE LOCATIONS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {luggageStoreData.map((location) => (
                <Card
                  key={location.name}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/search?location=${location.name}`)
                  }
                >
                  <CardContent className="p-3">
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={location.image || "/placeholder.svg"}
                        alt={`Luggage storage in ${location.name}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span>{location.locations} locations</span>
                          <span className="font-bold">{location.price}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-center font-semibold text-lg">
                      {location.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a237e] text-center mb-12">
              How it Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#1a237e] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold">Find Storage</h3>
                <p className="text-muted-foreground">
                  Choose from multiple locations near you
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#1a237e] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold">Book Online</h3>
                <p className="text-muted-foreground">
                  Reserve in advance to save time and money
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[#1a237e] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold">Store & Enjoy</h3>
                <p className="text-muted-foreground">
                  Drop off your bags and enjoy your day
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a237e] text-center mb-12">
              Why Choose NammaStore?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 relative">
                    <ClipboardCheck className="w-full h-full text-[#1a237e]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a237e]">
                    INSURANCE
                  </h3>
                  <p className="text-muted-foreground">
                    All luggage is insured against damage, loss, and theft
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 relative">
                    <HardHat className="w-full h-full text-[#1a237e]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a237e]">SAFETY</h3>
                  <p className="text-muted-foreground">
                    Only certified local shops approved by Lugsto
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 relative">
                    <Shield className="w-full h-full text-[#1a237e]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a237e]">SECURITY</h3>
                  <p className="text-muted-foreground">
                    Each bag is secured with a one-time security seal
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enquiry Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Customer Review */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold">CUSTOMER REVIEW</h3>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-slate-200 rounded-full overflow-hidden">
                      <Avatar>
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>CR</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h4 className="font-semibold">SIMON CUTCHEON</h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    "Everything worked perfectly. We arrived a bit earlier but
                    no problem to already leave our bags. The staff was really
                    nice, he even gave us some direction advice. Will definitely
                    use this service again."
                  </p>
                </div>
              </div>

              {/* Enquiry Form */}
              <EnquiryForm />
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-[#1a237e] text-white py-12 rounded-lg">
        <div className="mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-bold mb-4">About NammaStore</h4>
              <p className="text-sm text-blue-200">
                Store your bags in certified local shops & hotels.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Popular Cities</h4>
              <ul className="space-y-2">
                {luggageStoreData.slice(0, 4).map((city) => (
                  <li key={city.name}>
                    <Link
                      href={`/search?location=${city.name || ""}`}
                      className="text-sm text-blue-200 hover:text-white"
                    >
                      {city.name} ({city.locations} locations)
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="text-sm text-blue-200">
                  Email: info@nammastore.com
                </li>
                <li className="text-sm text-blue-200">
                  Phone: +91 90732471923
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-blue-200">
            <p>
              &copy; {new Date().getFullYear()} NammaStore. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
