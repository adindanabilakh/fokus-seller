"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, parse, isValid, isSameMonth, parseISO } from "date-fns";
import { IncomeEntry } from "@/lib/types"; // Import tipe yang sudah benar
import { addIncomeEntry, editIncomeEntry } from "@/lib/api";

// Definisi tipe untuk income entry

// Definisi tipe untuk props dialog
interface IncomeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: IncomeEntry) => void;
  editingEntry?: IncomeEntry | null;
  existingEntries: IncomeEntry[];
}

export function IncomeEntryDialog({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
  existingEntries,
}: IncomeEntryDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<IncomeEntry>();

  useEffect(() => {
    if (editingEntry) {
      const formattedDate =
        editingEntry.date && isValid(parseISO(editingEntry.date))
          ? format(parseISO(editingEntry.date), "yyyy-MM")
          : "";
      Object.keys(editingEntry).forEach((key) => {
        const typedKey = key as keyof IncomeEntry;

        setValue(
          typedKey,
          typedKey === "date" ? formattedDate : (editingEntry[typedKey] as any)
        );
      });
    } else {
      reset();
    }
  }, [editingEntry, setValue, reset]);

  const submitForm = async (data: IncomeEntry) => {
    try {
      const formattedDate = format(new Date(data.date), "yyyy-MM-dd");

      const newEntry = {
        ...data,
        date: formattedDate,
      };

      if (editingEntry) {
        await editIncomeEntry(editingEntry.id, newEntry);
      } else {
        await addIncomeEntry(newEntry);
      }

      reset();
      onClose(); // 🔥 Tutup dialog
      window.location.reload(); // 🔥 Reload hanya setelah submit
    } catch (error) {
      console.error("Failed to submit income entry", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {" "}
      {/* ❌ Tidak ada reload di sini */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingEntry ? "Edit Income Entry" : "Add Income Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { required: true, min: 0 })}
            />
          </div>
          <div>
            <Label htmlFor="source">Tanggal</Label>
            <Input id="source" {...register("source", { required: true })} />
          </div>
          <div>
            <Label htmlFor="date">Bulan</Label>
            <Input
              id="date"
              type="month"
              {...register("date", { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>
          <Button type="submit">
            {editingEntry ? "Update" : "Add"} Pendapatan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
