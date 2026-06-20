"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/services/eventService";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getEventById(id);
        setEvent(res.data);
      } catch (err) {
        setError("Event not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push(`/events/${id}/book`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-500">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-8">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <span className="text-xs font-medium uppercase text-gray-500">
            {event.category}
          </span>
          <h1 className="text-3xl font-bold mt-1">{event.title}</h1>

          <div className="flex flex-col gap-2 mt-4 text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {event.venue?.name}, {event.venue?.address}, {event.venue?.city}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-2">About this event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-3">Organized by</h2>
            <p className="text-gray-600">{event.organizer?.name}</p>
          </div>
        </div>

        <div className="border rounded-xl p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Pricing
          </h3>

          <div className="space-y-3 mb-6">
            {event.pricing?.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between text-sm border-b pb-2"
              >
                <span className="text-gray-600">{p.category}</span>
                <span className="font-semibold">₹{p.price}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {event.availableSeats} of {event.totalSeats} seats available
          </p>

          <Button
            className="w-full py-3"
            onClick={handleBookNow}
            disabled={event.availableSeats === 0}
          >
            {event.availableSeats === 0 ? "Sold Out" : "Book Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}