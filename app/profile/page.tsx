"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { Logo } from "@/components/logo"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      {/* Header */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* User Name */}
          <h1 className="text-2xl text-white mb-8">Praveen gupta</h1>

          {/* Bookings Link */}
          <div className="text-center mb-8">
            <p className="text-white">
              Looking for your booking? Go to{" "}
              <Link href="/bookings" className="text-blue-100 hover:underline">
                My bookings
              </Link>
            </p>
          </div>

          {/* User Information Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <p className="text-sm text-gray-600 mb-4">
              Make sure your contact information is accurate, so we can reach
              you regarding your bookings
            </p>
            <p className="text-sm text-gray-600 mb-6">
              If you need to change your email or phone number, please contact
              us
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-sm">Name</span>
                <span className="text-sm">Praveen gupta</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-sm">E-mail address</span>
                <span className="text-sm">praveenguptacgc@gmail.com</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                <span className="text-sm">Mobile phone</span>
                <span className="text-sm text-gray-400">Add phone number</span>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Security</h2>
            <p className="text-sm text-gray-600 mb-6">
              Keep your password strong to prevent unauthorized access to your
              account
            </p>

            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
              <span className="text-sm">Password</span>
              <div className="flex justify-between items-center">
                <span className="text-sm">••••••••</span>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Your payment methods</h2>
            <p className="text-sm text-gray-600 mb-4">
              You have no payment methods saved in your account.
            </p>
            <Button variant="outline" size="sm" className="bg-blue-50">
              New payment method
            </Button>
          </div>

          {/* Delete Account Section */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Delete Account</h2>
            <p className="text-sm text-gray-600 mb-4">
              Deleting your account will also remove all your personal
              information from our database.
            </p>
            <Button variant="destructive" size="sm">
              Delete my account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
