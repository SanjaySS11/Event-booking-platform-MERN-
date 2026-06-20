"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBookingById } from "@/services/bookingService";
import { requestRefund } from "@/services/refundService";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarDays, MapPin } from "lucide-react";

export default function ConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundMessage, setRefundMessage] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getBookingById(id);
        setBooking(res.data);
      } catch (err) {
        setError("Booking not found");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    setRefundSubmitting(true);

    try {
      await requestRefund(id, refundReason);
      setRefundMessage(
        "Refund request submitted successfully. Awaiting admin approval."
      );
      setShowRefundForm(false);
    } catch (err) {
      setRefundMessage(
        err.response?.data?.message || "Failed to submit refund request"
      );
    } finally {
      setRefundSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-500">
        Loading your ticket...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center text-red-500">
        {error || "Booking not found"}
      </div>
    );
  }

  const formattedDate = new Date(booking.event?.date).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-green-100 text-green-600 rounded-full p-3 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="text-gray-500 mt-1">
          Your ticket has been booked successfully
        </p>
      </div>

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-3">{booking.event?.title}</h2>

        <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {booking.event?.venue?.name}, {booking.event?.venue?.city}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          {booking.seats?.map((seat) => (
            <div key={seat._id} className="flex justify-between">
              <span className="text-gray-600">
                Seat {seat.seatNumber} ({seat.category})
              </span>
              <span>₹{seat.price}</span>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 flex justify-between font-semibold text-lg">
          <span>Total Paid</span>
          <span>₹{booking.totalAmount}</span>
        </div>
      </div>

      {booking.qrCode && (
        <div className="border rounded-xl p-6 flex flex-col items-center mb-6">
          <h3 className="font-semibold mb-4">Your Ticket QR Code</h3>
          <img
            src={booking.qrCode}
            alt="Booking QR Code"
            className="w-48 h-48"
          />
          <p className="text-xs text-gray-500 mt-3">
            Show this QR code at the venue entrance
          </p>
        </div>
      )}

      {/* Refund Section */}
      {booking.paymentStatus === "completed" &&
        booking.bookingStatus === "confirmed" && (
          <div className="border rounded-xl p-6 mb-6">
            {refundMessage ? (
              <p className="text-sm text-gray-600">{refundMessage}</p>
            ) : !showRefundForm ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowRefundForm(true)}
              >
                Request Refund
              </Button>
            ) : (
              <form onSubmit={handleRefundSubmit} className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Reason for refund
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                  placeholder="Let us know why you'd like a refund..."
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={refundSubmitting}
                    className="flex-1"
                  >
                    {refundSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRefundForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

      <Link href="/bookings">
        <Button className="w-full py-3" variant="outline">
          View All My Bookings
        </Button>
      </Link>
    </div>
  );
}