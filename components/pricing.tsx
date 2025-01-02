"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuggageStorageForm } from "./luggage-storage-form1";

const tiers = [
  {
    name: "Small",
    price: 500,
    description: "Perfect for small luggage up to 10 kg",
    features: ["Up to 10 kg", "24/7 access", "Monthly contract"],
  },
  {
    name: "Medium",
    price: 750,
    description: "Ideal for medium-sized luggage up to 15 kg",
    features: [
      "Up to 15 kg",
      "24/7 access",
      "Monthly contract",
      "Priority support",
    ],
  },
  {
    name: "Large",
    price: 1000,
    description: "For larger items up to 20 kg",
    features: [
      "Up to 20 kg",
      "24/7 access",
      "Flexible contract",
      "Concierge service",
      "Free packing materials",
    ],
  },
];

export default function Pricing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBag, setSelectedBag] = useState("");

  const openModal = (name: string) => {
    // console.log("ddd", price);

    setSelectedBag(name);
    setIsModalOpen(true);
  };

  // console.log("priceeee", price);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div id="pricing" className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {tier.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹{tier.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /month
                  </span>
                </p>
                <Button
                  className="mt-8 w-full"
                  onClick={() => openModal(tier.name)}
                >
                  Get started
                </Button>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="h-[80%] overflow-auto">
              <LuggageStorageForm selectedBag={selectedBag} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
