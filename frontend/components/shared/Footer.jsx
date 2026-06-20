export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} EventBook. All rights reserved.
      </div>
    </footer>
  );
}