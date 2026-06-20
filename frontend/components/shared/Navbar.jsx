"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";
import { Ticket } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Ticket className="h-6 w-6" />
          EventBook
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/events" className="text-sm font-medium hover:text-primary">
            Events
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/bookings" className="text-sm font-medium hover:text-primary">
                My Bookings
              </Link>
              <span className="text-sm text-gray-600">Hi, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}