"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
}

interface AddProductFormProps {
  onAdd: (data: ProductFormData) => void; // Fungsi menerima data produk
  onCancel: () => void; // Fungsi tanpa parameter
}

export function AddProductForm({ onAdd, onCancel }: AddProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>();

  // Fungsi format Rupiah untuk tampilan saja
  const formatRupiah = (value: string) => {
    return value
      .replace(/\D/g, "") // Hanya angka
      .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Tambahkan titik pemisah ribuan
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka
    setValue("price", rawValue ? parseInt(rawValue, 10) : 0); // Simpan sebagai number
  };

  const priceValue = watch("price", 0); // Ambil nilai asli angka

  const onSubmit = (data: ProductFormData) => {
    onAdd({
      ...data,
      price: Number(data.price), // Pastikan harga dikirim sebagai angka
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nama Produk</Label>
        <Input
          id="name"
          {...register("name", { required: "Product name is required" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="price">Harga (IDR)</Label>
        <Input
          id="price"
          type="text"
          onChange={handlePriceChange}
          value={priceValue ? `Rp. ${formatRupiah(priceValue.toString())}` : ""}
        />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Tambah Produk</Button>
      </div>
    </form>
  );
}
