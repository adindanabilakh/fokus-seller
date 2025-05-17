"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Definisi tipe data untuk income entry
interface IncomeEntry {
  amount: number;
  source: string;
  frequency: string;
  date: string;
  notes?: string;
}

// Tipe data untuk props form
interface IncomeEntryFormProps {
  onSubmit: (entry: IncomeEntry) => void;
}

export function IncomeEntryForm({ onSubmit }: IncomeEntryFormProps) {
  const [frequency, setFrequency] = useState("daily");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeEntry>();

  const submitForm = (data: IncomeEntry) => {
    onSubmit({ ...data, frequency });
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambahkan jumlah pendapatan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          {/* Amount Field */}
          <div>
            <Label htmlFor="amount">Jumlah Pendapatan</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", {
                required: "Amount is required",
                min: 0,
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">
                {errors.amount.message?.toString()}
              </p>
            )}
          </div>

          {/* Source Field */}
          <div>
            <Label htmlFor="source">Tanggal</Label>
            <Input
              id="source"
              {...register("source", { required: "Source is required" })}
            />
            {errors.source && (
              <p className="text-sm text-red-500">
                {errors.source.message?.toString()}
              </p>
            )}
          </div>

          {/* Frequency Selection */}
          <div>
            <Label htmlFor="frequency">Frekuensi</Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              options={[
                { label: "Daily", value: "daily" },
                { label: "Monthly", value: "monthly" },
              ]}
            >
              <SelectTrigger>
                <SelectValue value={frequency || "daily"} />
              </SelectTrigger>
            </Select>
          </div>

          {/* Date Field */}
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-sm text-red-500">
                {errors.date.message?.toString()}
              </p>
            )}
          </div>

          {/* Notes Field */}
          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>

          {/* Submit Button */}
          <Button type="submit">Tambah Pendapatan</Button>
        </form>
      </CardContent>
    </Card>
  );
}
