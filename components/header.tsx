import Link from "next/link";
import { Luggage } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center">
              <Luggage className="h-8 w-auto sm:h-10 text-indigo-600" />
              <span className="ml-3 text-xl font-bold text-gray-900">
                MonthlyLuggage
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
            <Link
              href="#features"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
