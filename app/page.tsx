"use client";

import { SearchForm } from "@/components/search-form";
import { Luggage } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 md:p-24 gradient-bg text-white">
      <div className="max-w-6xl w-full space-y-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Luggage className="h-16 w-16 md:h-24 md:w-24 text-white opacity-20  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight relative z-10">
              NammaStore
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
      </div>
    </div>
  );
}
