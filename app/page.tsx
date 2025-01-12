import { SearchForm } from "@/components/search-form";
import { Luggage } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 md:p-24 gradient-bg text-white">
      <div className="max-w-6xl w-full space-y-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Luggage className="h-16 w-16 md:h-24 md:w-24 text-white opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight relative z-10">
              LuggageHero
            </h1>
          </div>
          <p className="text-xl md:text-2xl max-w-2xl">
            Store your bags with our verified partners and explore the city
            hands-free
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 shadow-lg">
          <SearchForm />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              title: "Convenient Locations",
              description:
                "Find storage spots near popular attractions and transport hubs.",
            },
            {
              title: "Flexible Booking",
              description:
                "Book by the hour or day, change plans with free cancellation.",
            },
            {
              title: "Secure Storage",
              description:
                "All bags are insured and stored in verified partner locations.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover-lift"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16 float-animation">
        <Image
          src="/placeholder.svg"
          alt="Luggage storage illustration"
          width={300}
          height={300}
          className="rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}
