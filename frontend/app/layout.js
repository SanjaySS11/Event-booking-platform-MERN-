import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import AuthInitializer from "@/components/shared/AuthInitializer";

export const metadata = {
  title: "Event Ticket Booking Platform",
  description: "Book tickets for your favorite events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎟️</text></svg>"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
        <AuthInitializer />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}