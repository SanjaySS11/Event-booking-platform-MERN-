"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function AuthInitializer() {
  const loadAuth = useAuthStore((state) => state.loadAuth);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return null;
}