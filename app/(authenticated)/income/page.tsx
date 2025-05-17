"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IncomeEntryDialog } from "@/components/income-entry-dialog";
import { IncomeOverview } from "@/components/income-overview";
import { IncomeTable } from "@/components/income-table";
import {
  fetchIncomeEntries,
  addIncomeEntry,
  editIncomeEntry,
  deleteIncomeEntry,
} from "@/lib/api"; // API Calls
import { IncomeEntry } from "@/lib/types";

export default function IncomePage() {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);

  // ✅ Fetch income saat halaman pertama kali dimuat
  const loadIncomeEntries = useCallback(async () => {
    try {
      const data = await fetchIncomeEntries();
      setIncomeEntries(data);
    } catch (error) {
      console.error("Failed to fetch income data", error);
    }
  }, []);

  useEffect(() => {
    loadIncomeEntries();
  }, [loadIncomeEntries]); // ✅ Tidak perlu state `refresh`

  // ✅ Tambah income dan langsung update state
  const handleAddIncome = async (entry: IncomeEntry) => {
    try {
      const newEntry = await addIncomeEntry(entry);
      setIncomeEntries((prev) => [...prev, newEntry.income]); // 🔥 Update langsung tanpa reload
    } catch (error) {
      console.error("Failed to add income", error);
    }
  };

  // ✅ Edit income dan langsung update state
  const handleEditIncome = async (updatedEntry: IncomeEntry) => {
    try {
      const response = await editIncomeEntry(updatedEntry.id, updatedEntry);
      setIncomeEntries((prev) =>
        prev.map((entry) =>
          entry.id === updatedEntry.id ? response.income : entry
        )
      ); // 🔥 Update langsung tanpa reload
    } catch (error) {
      console.error("Failed to edit income", error);
    }
  };

  // ✅ Hapus income dan langsung update state
  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncomeEntry(id);
      setIncomeEntries((prev) => prev.filter((entry) => entry.id !== id)); // 🔥 Update langsung tanpa reload
    } catch (error) {
      console.error("Failed to delete income", error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Pendapatan</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pendapatan
        </Button>
      </div>

      {/* ✅ Overview akan selalu mendapatkan data terbaru */}
      <IncomeOverview incomeEntries={incomeEntries} />

      {/* ✅ Table akan selalu mendapatkan data terbaru */}
      <IncomeTable
        incomeEntries={incomeEntries}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsDialogOpen(true);
        }}
        onDelete={handleDeleteIncome}
      />

      {/* ✅ Form Dialog akan selalu mendapatkan data terbaru */}
      <IncomeEntryDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={(entry) => {
          if (editingEntry) {
            handleEditIncome(entry);
          } else {
            handleAddIncome(entry);
          }
          setIsDialogOpen(false);
          setEditingEntry(null);
        }}
        editingEntry={editingEntry}
        existingEntries={incomeEntries}
      />
    </div>
  );
}
