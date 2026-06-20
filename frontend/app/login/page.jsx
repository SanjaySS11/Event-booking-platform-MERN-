"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { Ticket } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser(formData);
      setAuth(res.data.user, res.data.token);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-black text-white rounded-2xl p-4 mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-base text-gray-500 mt-2">
            Login to continue booking your favorite events
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email "
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 h-12 text-base mt-2"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-base text-center text-gray-500 mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-black hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}