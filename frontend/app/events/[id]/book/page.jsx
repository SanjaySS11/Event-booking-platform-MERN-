"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/services/eventService";
import { createBooking } from "@/services/bookingService";
import { Button } from "@/components/ui/button";
import useSocket from "@/hooks/useSocket";

export default function SeatSelectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const socketRef = useSocket(id);

  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedByOthers, setLockedByOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEventById(id);
        setEvent(res.data);
      } catch (err) {
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Listen for real-time seat updates
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    const handleSeatUpdate = ({ seatNumber, status }) => {
      setSelectedSeats((currentSelected) => {
        const isMySeat = currentSelected.some((s) => s.seatNumber === seatNumber);

        if (status === "locked" || status === "booked") {
          if (!isMySeat) {
            setLockedByOthers((prev) => [...new Set([...prev, seatNumber])]);
          }
        } else if (status === "available") {
          setLockedByOthers((prev) => prev.filter((s) => s !== seatNumber));
        }

        return currentSelected;
      });
    };
    socket.on("seatStatusUpdate", handleSeatUpdate);

    return () => {
      socket.off("seatStatusUpdate", handleSeatUpdate);
    };
  }, [socketRef]);

  const getPriceForCategory = (category) => {
    const pricing = event?.pricing?.find((p) => p.category === category);
    return pricing ? pricing.price : 0;
  };

  const toggleSeat = (seat) => {
    if (seat.isBooked || lockedByOthers.includes(seat.seatNumber)) return;

    const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (isSelected) {
      setSelectedSeats((prev) =>
        prev.filter((s) => s.seatNumber !== seat.seatNumber)
      );
      socketRef.current?.emit("seatUnlocked", {
        eventId: id,
        seatNumber: seat.seatNumber,
      });
    } else {
      const category = event.pricing?.[0]?.category || "General";
      const price = getPriceForCategory(category);

      setSelectedSeats((prev) => [
        ...prev,
        { seatNumber: seat.seatNumber, category, price },
      ]);
      socketRef.current?.emit("seatLocked", {
        eventId: id,
        seatNumber: seat.seatNumber,
      });
    }
  };

  const totalAmount = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  const handleProceed = async () => {
    if (selectedSeats.length === 0) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await createBooking({
        eventId: id,
        seats: selectedSeats,
      });

      router.push(`/bookings/${res.data.booking._id}/payment`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-500">
        Loading seats...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-red-500">
        Event not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
      <p className="text-gray-500 mb-8">Select your seats</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 border" /> Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-black" /> Selected
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400" /> Locked/Booked
        </div>
      </div>

      {/* Seat Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 mb-10 w-full">
        {event.seats?.map((seat) => {
          const isSelected = selectedSeats.some(
            (s) => s.seatNumber === seat.seatNumber
          );
          const isUnavailable =
            seat.isBooked || lockedByOthers.includes(seat.seatNumber);

          return (
            <button
              key={seat._id}
              onClick={() => toggleSeat(seat)}
              disabled={isUnavailable}
              className={`w-full h-12 rounded-md text-xs font-medium flex items-center justify-center transition
                ${isSelected ? "bg-black text-white" : ""}
                ${isUnavailable
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : !isSelected
                    ? "bg-gray-100 hover:bg-gray-200"
                    : ""
                }
              `}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="border rounded-xl p-6 flex items-center justify-between sticky bottom-4 bg-white shadow-sm">
        <div>
          <p className="text-sm text-gray-500">
            {selectedSeats.length} seat(s) selected
          </p>
          <p className="text-xl font-bold">₹{totalAmount}</p>
        </div>
        <Button
          onClick={handleProceed}
          disabled={selectedSeats.length === 0 || submitting}
          className="py-3 px-6"
        >
          {submitting ? "Processing..." : "Proceed to Payment"}
        </Button>
      </div>
    </div>
  );
}