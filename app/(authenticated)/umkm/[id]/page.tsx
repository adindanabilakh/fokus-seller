"use client";
import { UMKMDetailForm } from "@/components/umkm-detail-form";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function UMKMDetailPage() {
  const [umkmData, setUmkmData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = (time: string) => {
    if (!time) return "Unknown";
    return time.slice(0, 5); // ✅ Ambil hanya HH:MM tanpa :00 di belakang
  };

  useEffect(() => {
    const fetchUMKM = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/api/umkm/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.id) {
          setUmkmData({
            ...res.data,
            open_time: formatTime(res.data.open_time), // ✅ Format waktu 24 jam
            close_time: formatTime(res.data.close_time), // ✅ Format waktu 24 jam
          });
        } else {
          console.error("UMKM data tidak ditemukan:", res.data);
        }
      } catch (error) {
        console.error("Error fetching UMKM data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUMKM();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!umkmData) return <div>Error: UMKM not found</div>;

  return (
    <div className="container mx-auto py-8 px-5">
      <h1 className="text-3xl font-bold mb-6">UMKM Details</h1>
      <UMKMDetailForm umkmData={umkmData} />
    </div>
  );
}
