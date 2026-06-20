"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMyBookings } from "@/services/bookingService";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        setBookings(res.data);
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-gray-500 mt-1">
          View and manage all your event bookings
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading bookings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-16 border rounded-xl">
          <Ticket className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">You have no bookings yet</p>
          <Link href="/events" className="text-sm font-semibold underline">
            Browse Events
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => {
          const formattedDate = booking.event
            ? new Date(booking.event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";

          const isPending = booking.bookingStatus === "pending";
          const linkHref = isPending
            ? `/bookings/${booking._id}/payment`
            : `/bookings/${booking._id}/confirmation`;

          return (
            <Link
              key={booking._id}
              href={linkHref}
              className="block border rounded-xl p-5 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {booking.event?.title || "Event"}
                  </h3>

                  <div className="flex flex-col gap-1.5 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formattedDate}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {booking.event?.venue?.city}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {booking.seats?.length} seat(s) · ₹{booking.totalAmount}
                  </p>
                </div>

                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                    statusColors[booking.bookingStatus] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {booking.bookingStatus}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}