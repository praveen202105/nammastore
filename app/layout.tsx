import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "@/store/userContext";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "NammaStore App",
  description: "NammaStore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-sans antialiased overflow-y-hidden`}
      >
        {" "}
        <UserProvider>
          <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
            <NavBar />
           
            <div className=" h-[calc(100vh-50px)]">
              <ScrollArea className="h-full w-full">
                <div className="pl-4 pr-[4px] pt-10 sm:px-6 md:px-8">
                  {children}
                </div>
              </ScrollArea>
            </div>
          </GoogleOAuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}
