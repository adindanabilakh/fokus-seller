"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormData {
  name: string;
  type: string;
  address: string;
  location_url: string;
  email: string;
  password: string;
  confirmPassword: string;
  document?: FileList; // 🆕 Tambahkan untuk file upload
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const router = useRouter();

  // 🔹 Fetch categories dari API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`
        );
        const result = await response.json();

        setCategories(
          result.map((category: any) => ({
            label: category.name,
            value: category.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("address", data.address);
      formData.append(
        "location_url",
        "https://maps.app.goo.gl/PUK8ZuGeF1oDMTE97"
      );
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("password_confirmation", data.confirmPassword);

      // 🆕 Jika ada file yang dipilih, tambahkan ke FormData
      if (data.document && data.document.length > 0) {
        formData.append("document", data.document[0]);
      }

      const response = await fetch("http://localhost:8000/api/umkm/register",
        //`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/umkm/register`,
        {
          method: "POST",
          body: formData, // ✅ Kirim sebagai FormData
          headers: {'Accept': 'application/json'  // penting supaya Laravel tahu ini API request
  }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // 🔥 Hapus token jika ada (agar tidak langsung ke dashboard)
      Cookies.remove("token");
      localStorage.removeItem("umkm");

      // 🔥 Redirect ke halaman login dengan query `pending=true`
      router.push("/login?pending=true");
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Buat akun UMKM baru anda</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <p className="text-sm text-red-500 text-center mb-2">
            {errorMessage}
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama UMKM</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="type">Tipe UMKM</Label>
            <select
              id="type"
              {...register("type", { required: "Type is required" })}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Pilih Tipe UMKM</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
          {/* 🆕 Input Upload File */}
          <div>
            <Label htmlFor="document">Unggah Dokumen</Label>
            <Input
              id="document"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              {...register("document")}
            />
            <span className="text-xs font-light text-sky-500">
              Upload foto sertifikat atau foto gerobak
            </span>
          </div>
          <div className="hidden">
            <Label htmlFor="location_url">Location URL</Label>
            <Input
              id="location_url"
              {...register("location_url")}
              value=""
              readOnly
            />
          </div>
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
          <div className="relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val: string) => {
                  if (watch("password") !== val) {
                    return "Passwords do not match";
                  }
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="text-center mt-4">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
