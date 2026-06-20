"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookingById } from "@/services/bookingService";
import { createPaymentOrder, verifyPayment } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

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

  const handlePayment = async () => {
    setProcessing(true);
    setError("");

    try {
      // Step 1: Create Razorpay order via our backend
      const orderRes = await createPaymentOrder(id);
      const { orderId, amount, currency } = orderRes.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "EventBook",
        description: booking.event?.title,
        order_id: orderId,
        handler: async (response) => {
          // Step 3: Verify payment with our backend
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: id,
            });
            router.push(`/bookings/${id}/confirmation`);
          } catch (err) {
            setError("Payment verification failed");
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-500">
        Loading booking...
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">Complete your payment</h1>
      <p className="text-gray-500 mb-8">Review your booking before paying</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">{booking.event?.title}</h2>

        <div className="space-y-2 text-sm">
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
          <span>Total</span>
          <span>₹{booking.totalAmount}</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={processing}
        className="w-full py-3 text-base"
      >
        {processing ? "Processing..." : `Pay ₹${booking.totalAmount}`}
      </Button>
    </div>
  );
}