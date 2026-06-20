import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-center">
        Event Ticket Booking Platform
      </h1>
      <Button>Get Started</Button>
    </main>
  );
}