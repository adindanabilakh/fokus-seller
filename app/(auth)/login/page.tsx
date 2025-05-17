"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Pindahkan ini ke dalam Suspense jika dipakai langsung

  useEffect(() => {
    // ✅ Pastikan hanya dipanggil setelah komponen telah di-mount
    if (
      typeof window !== "undefined" &&
      searchParams.get("pending") === "true"
    ) {
      setPendingApproval(true);
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setPendingApproval(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/umkm/login`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
          credentials: "omit",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.message === "Invalid credentials") {
          throw new Error("Email atau password salah. Coba lagi.");
        }
        if (result.message.includes("pending approval")) {
          setPendingApproval(true);
          return;
        }
        throw new Error(result.message || "Login gagal. Coba lagi.");
      }

      // ✅ Simpan token ke localStorage dan Cookies
      localStorage.setItem("token", result.token);
      Cookies.set("token", result.token, { expires: 7 });

      // ✅ Simpan data UMKM untuk akses selanjutnya
      localStorage.setItem("umkm", JSON.stringify(result.umkm));

      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Masukkan data akun Anda untuk mengakses akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <p className="text-sm text-red-500 text-center mb-2">
              {errorMessage}
            </p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Lupa Password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-center mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* 🔥 Popup jika akun masih Pending */}
      {pendingApproval && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-bold text-red-600">
              Akun Belum Disetujui
            </h2>
            <p className="text-gray-600 mt-2">
              Akun Anda masih menunggu persetujuan admin sebelum dapat
              digunakan.
            </p>
            <p className="text-gray-600 mt-1">
              Hubungi admin untuk mempercepat proses verifikasi. Cek spam akun email anda secara berkala untuk mendapatkan pemberitahuan.
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Button onClick={() => setPendingApproval(false)}>Tutup</Button>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20sudah%20mendaftar%20UMKM,%20mohon%20bantuannya%20untuk%20verifikasi."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="bg-green-500 text-white">
                  Hubungi Admin via WhatsApp.
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 🔥 Bungkus `LoginForm` dalam Suspense untuk mengatasi error
export default function LoginPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
