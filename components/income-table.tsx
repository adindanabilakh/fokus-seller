"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { format, parse, parseISO } from "date-fns";

// Ensure date-fns is installed by running: npm install date-fns

interface IncomeEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  notes?: string;
}

interface IncomeTableProps {
  incomeEntries: IncomeEntry[];
  onEdit: (entry: IncomeEntry) => void;
  onDelete: (id: string) => void;
}

export function IncomeTable({
  incomeEntries,
  onEdit,
  onDelete,
}: IncomeTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IncomeEntry;
    direction: "ascending" | "descending";
  }>({
    key: "date",
    direction: "descending",
  });
  const [filter, setFilter] = useState("");

  const sortedEntries = [...incomeEntries].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? "";
    const bValue = b[sortConfig.key] ?? "";

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredEntries = sortedEntries.filter(
    (entry) =>
      entry.source.toLowerCase().includes(filter.toLowerCase()) ||
      format(
        parse(entry.date.split(" to ")[0], "yyyy-MM-dd", new Date()),
        "MMMM yyyy"
      )
        .toLowerCase()
        .includes(filter.toLowerCase())
  );

  const requestSort = (key: keyof IncomeEntry) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <Input
        placeholder="Filter berdasarkan tanggal atau bulan"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort("date")}>
                Tanggal
              </Button>
            </TableHead>
             <TableHead>
              <Button variant="ghost" onClick={() => requestSort("source")}>
                Bulan
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort("amount")}>
                Pendapatan
              </Button>
            </TableHead>

            <TableHead>Catatan</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map((entry) => (
            <TableRow key={entry.id}>
            <TableCell>{entry.source}</TableCell>
              <TableCell>
                {entry.date
                  ? format(parseISO(entry.date), "MMMM yyyy") // 🔥 Gunakan parseISO untuk safety
                  : "Invalid Date"}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(entry.amount)}
              </TableCell>
              <TableCell>{entry.notes}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
