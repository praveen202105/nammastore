import Link from "next/link";
import { Luggage } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-4">
            <Luggage className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl text-primary">NammaStore</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 mb-6">
            <Link
              href="/about"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/faq"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LuggageHero. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
