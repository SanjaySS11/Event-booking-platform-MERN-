import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

export default function EventCard({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const startingPrice =
    event.pricing && event.pricing.length > 0
      ? Math.min(...event.pricing.map((p) => p.price))
      : null;

  return (
    <Link
      href={`/events/${event._id}`}
      className="block border rounded-xl overflow-hidden hover:shadow-md transition group"
    >
      <div className="aspect-4/3 bg-gray-100 flex items-center justify-center overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="p-4">
        <span className="text-xs font-medium uppercase text-gray-500">
          {event.category}
        </span>
        <h3 className="font-semibold text-lg mt-1 line-clamp-1">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
          <CalendarDays className="h-4 w-4" />
          {formattedDate}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
          <MapPin className="h-4 w-4" />
          {event.venue?.city}
        </div>

        {startingPrice && (
          <p className="text-sm font-semibold mt-3">
            Starting ₹{startingPrice}
          </p>
        )}
      </div>
    </Link>
  );
}
