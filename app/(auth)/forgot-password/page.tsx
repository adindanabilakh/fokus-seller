"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

interface ForgotFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>();

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forgot-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to request reset:", err);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>Masukkan email yang terdaftar</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <p className="text-green-600 text-sm text-center">
            Link reset password telah dikirim ke email kamu.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email wajib diisi" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Kirim Link Reset
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
