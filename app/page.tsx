"use client"
import { SearchForm } from "@/components/search-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Home() {
  const router = useRouter();

  const cities = [
    {
      name: "Bengaluru",
      image: "/bangalore.jpg",
      landmark: "Vidhana Soudha",
    },
    {
      name: "Delhi",
      image: "/delhi.jpg",
      landmark: "India Gate",
    },
    {
      name: "Chennai",
      image: "/chennai.jpg",
      landmark: "Central Station",
    },
    {
      name: "Mumbai",
      image: "/delhi.jpg",
      landmark: "Gateway of India",
    },

    {
      name: "Hyderabad",
      image: "/hyderabad.jpg",
      landmark: "Charminar",
    },
    {
      name: "Pune",
      image: "/chennai.jpg",
      landmark: "Shaniwar Wada",
    },
  ];

  return (
    <div>
      <main>
        {/* Hero Section */}
        <section className="relative bg-[#1a237e] text-white mt-[30px] py-16 rounded-lg">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h1 className="flex flex-col">
                <span className="text-4xl md:text-6xl font-bold">
                  {"Store Your Luggage "}
                </span>
                <Typewriter
                  text={["Anywhere", "Anytime", "By Anyone"]}
                  speed={70}
                  waitTime={1500}
                  deleteSpeed={40}
                  cursorChar={""}
                  className="text-3xl md:text-5xl  font-bold"
                />
              </h1>

              <Card className="bg-white p-6">
                <CardContent className="p-0 space-y-4">
                  <SearchForm />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-800 opacity-50" />
        </section>

        {/* Cities Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a237e] text-center mb-12">
              TOP CITIES
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cities.map((city) => (
                  <Card
                    key={city.name}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      router.push(`/search?location=${city.name}`)
                    }
                  >
                    <CardContent className="p-3">
                      <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={city.image || "/placeholder.svg"}
                          alt={city.landmark}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="text-center font-semibold text-lg">
                        {city.name}
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
              <div className="space-y-8">
                <h3 className="text-2xl font-bold">ENQUIRE NOW</h3>
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input placeholder="Your name" />
                    <Input type="email" placeholder="Your email" />
                  </div>
                  <Input type="tel" placeholder="Your mobile number" />
                  <Textarea
                    placeholder="Your Message"
                    className="min-h-[150px]"
                  />
                  <Button className="w-full md:w-auto px-8 bg-[#1a237e] hover:bg-[#1a237e]/90">
                    SEND YOUR MESSAGE
                  </Button>
                </form>
              </div>
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
                {cities.slice(0, 4).map((city) => (
                  <li key={city.name}>
                    <Link
                      href={`/search?location=${city.name || ""}`}
                      className="text-sm text-blue-200 hover:text-white"
                    >
                      {city.name}
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
