"use client";

import MyContext from "@/utils/Context";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

export default function OfflinePage() {
  const context = useContext(MyContext);
  const router = useRouter();
  if (!context) return null;
  const { setOffline } = context;

  const handleTryAgain = () => {
    setOffline(false);
    router.replace("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Offline</h1>
        <p className="text-lg mb-4">
          Sintesa v3 sedang Offline. Silakan coba beberapa saat lagi.
        </p>
        <button
          onClick={handleTryAgain}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
