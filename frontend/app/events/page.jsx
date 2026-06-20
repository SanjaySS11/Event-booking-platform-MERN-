"use client";

import { useState, useEffect } from "react";
import { getAllEvents } from "@/services/eventService";
import EventCard from "@/components/events/EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEvents();
        setEvents(res.data.events);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Discover Events</h1>
        <p className="text-gray-500 mt-1">
          Find and book tickets for the best events near you
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading events...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && events.length === 0 && (
        <p className="text-gray-500">No events found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}