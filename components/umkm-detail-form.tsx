"use client";

import type React from "react";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface UMKMFormData {
  id: string;
  name: string;
  status: string;
  address: string;
  location_url: string;
  email: string;
  phone_number?: string; // 🆕 Tambahkan nomor telepon
  password?: string;
  document?: FileList; // 🆕 Tetap gunakan untuk document
  images?: FileList; // 🆕 Tambahkan untuk multi-image UMKM
  description?: string; // 🔥 Tambahkan description opsional
  open_time: "";
  close_time: "";
}

function TutorialDialog({ umkmData }: { umkmData?: UMKMFormData }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          <Info className="mr-2 h-4 w-4" />
          Cara Embed Maps
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[40rem] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>
            Tutorial Mengambil embed Maps dari GoogleMaps
          </DialogTitle>
          <DialogDescription>
            Panduan langkah demi langkah untuk menyematkan Google Maps.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <p>
              <strong>Untuk URL Google Maps, ikuti langkah berikut:</strong>
            </p>
            <ol className="list-decimal list-inside pl-4">
              <li className="py-6">
                Buka <strong>Google Maps</strong> dan cari lokasi UMKM Anda.
                <img
                  src="/images/tutorial/langkah1.png"
                  alt="Bagikan Google Maps"
                  className="w-1/2 rounded-md"
                />
              </li>
              <li className="pb-6">
                Klik tombol <strong>"Bagikan"</strong>.
                <img
                  src="/images/tutorial/langkah2.png"
                  alt="Bagikan Google Maps"
                  className="w-1/2 rounded-md"
                />
              </li>
              <li className="pb-6">
                Pilih opsi <strong>"Sematkan Peta"</strong>.
                <img
                  src="/images/tutorial/langkah3.png"
                  alt="Bagikan Google Maps"
                  className="w-1/2 rounded-md"
                />
              </li>
              <li className="pb-6">
                Salin URL yang diberikan.
                <img
                  src="/images/tutorial/langkah4.png"
                  alt="Bagikan Google Maps"
                  className="w-1/2 rounded-md"
                />
              </li>
              <li>
                Tempelkan URL ke kolom <strong>"Google Maps URL"</strong>.
              </li>
            </ol>
          </div>

          {/* Langkah 2 */}
          <div>
            <p>
              <strong>
                4. Klik tombol "Update UMKM" untuk menyimpan perubahan.
              </strong>
            </p>
          </div>
        </div>

        {/* Jika ada lokasi Google Maps */}
        {/* {umkmData?.location_url && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Peta Lokasi Anda Saat Ini:</h4>
            <iframe
              src={umkmData.location_url}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )} */}
      </DialogContent>
    </Dialog>
  );
}

export function UMKMDetailForm({ umkmData }: { umkmData?: UMKMFormData }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UMKMFormData>({
    defaultValues: umkmData ?? {
      id: "",
      name: "",
      status: "Pending",
      address: "",
      location_url: "",
      email: "",
      phone_number: "",
      password: "",
      document: undefined,
      images: undefined, // ✅ Tetapkan images sebagai undefined, bukan FileList langsung
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>( // 🆕 Fix dengan `Array.from()`
    umkmData?.images
      ? Array.from(umkmData.images).map(
          (img) => `${API_BASE_URL}/storage/${img}`
        )
      : []
  );

  const [documentPreview, setDocumentPreview] = useState<string | null>(
    umkmData?.document ? `${API_BASE_URL}/storage/${umkmData.document}` : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files); // Konversi FileList ke Array<File>
      const validFiles = filesArray.filter(
        (file) => file.size <= 2 * 1024 * 1024
      );

      if (validFiles.length !== filesArray.length) {
        toast.error("Beberapa gambar melebihi batas 2MB dan tidak diunggah.");
      }

      setValue("images", validFiles as any, { shouldDirty: true });

      // ✅ Gabungkan gambar dari database dengan preview gambar baru
      setImagePreviews((prevImages) => [
        ...prevImages,
        ...validFiles.map((file) => URL.createObjectURL(file)),
      ]);

      console.log("Images selected:", validFiles);
      console.log("Updated images state:", watch("images")); // Cek apakah state berubah
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Dokumen melebihi batas 2MB dan tidak diunggah.");
        return;
      }

      setValue("document", file as any, { shouldDirty: true });
      setDocumentPreview(URL.createObjectURL(file));

      console.log("Document selected:", file);
    }
  };

  const onSubmit = async (data: UMKMFormData) => {
    if (!data.id) {
      toast.error("UMKM ID tidak ditemukan!");
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", data.name);
      formData.append("status", data.status);
      formData.append("address", data.address);
      formData.append("location_url", data.location_url);
      formData.append("email", data.email);
      formData.append("description", data.description || "");
      formData.append("open_time", data.open_time); // ✅ Kirim jam buka
      formData.append("close_time", data.close_time); // ✅ Kirim jam tutup

      if (data.phone_number) {
        formData.append("phone_number", data.phone_number);
      }

      if (data.password) {
        formData.append("password", data.password);
      }

      console.log("Data sebelum dikirim ke backend:", data);
      console.log("isDirty:", isDirty);
      console.log("Images sebelum dikirim:", data.images);

      // 🛠 Kirim document hanya jika ada perubahan
      if (data.document instanceof File) {
        console.log("Uploading document:", data.document);
        formData.append("document", data.document);
      }

      // 🛠 Hanya kirim images jika ada perubahan dan bukan kosong
      if (isDirty && Array.isArray(data.images) && data.images.length > 0) {
        console.log("Images yang akan dikirim:", data.images);
        data.images.forEach((image, index) => {
          if (image instanceof File) {
            console.log(`Uploading image ${index}:`, image);
            formData.append("images[]", image);
          }
        });
      } else {
        console.log("Tidak ada images baru yang dikirim.");
      }

      // Log seluruh isi `FormData`
      for (let pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      await axios.post(`${API_BASE_URL}/api/umkms/${data.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("UMKM berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating UMKM:", error);
      toast.error("Gagal memperbarui UMKM. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (umkmData) {
      setValue("phone_number", umkmData.phone_number ?? "", {
        shouldDirty: false,
      });
      setValue("description", umkmData.description ?? "", {
        shouldDirty: false,
      });

      setValue("open_time", umkmData.open_time ?? "", {
        shouldDirty: false,
      });

      setValue("close_time", umkmData.close_time ?? "", {
        shouldDirty: false,
      });

      // ✅ Pastikan images dari database adalah array string sebelum diproses
      if (Array.isArray(umkmData.images)) {
        setImagePreviews(
          umkmData.images.map((img: string) => `${API_BASE_URL}/storage/${img}`)
        );
      } else {
        setImagePreviews([]);
      }

      setDocumentPreview(
        typeof umkmData.document === "string" ? `${umkmData.document}` : null
      );
    }
  }, [umkmData, setValue]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Detail UMKM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama UMKM</Label>
                    <Input
                      id="name"
                      {...register("name", {
                        required: "UMKM Name is required",
                      })}
                      aria-invalid={errors.name ? "true" : "false"}
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <textarea
                      id="description"
                      {...register("description")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Enter a brief description of the UMKM"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Nomor Handphone</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      {...register("phone_number", {
                        pattern: {
                          value: /^[0-9+]{10,15}$/,
                          message: "Invalid phone number",
                        },
                      })}
                      aria-invalid={errors.phone_number ? "true" : "false"}
                    />
                    {errors.phone_number && (
                      <span className="text-red-500 text-sm">
                        {errors.phone_number.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Alamat</Label>
                    <Input
                      id="address"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      aria-invalid={errors.address ? "true" : "false"}
                    />
                    {errors.address && (
                      <span className="text-red-500 text-sm">
                        {errors.address.message}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="open_time">Jam Buka  <span className="text-xs font-light text-red-500">
              (Jika libur, atur waktu 00:00)
            </span></Label>
                      <Input
                        id="open_time"
                        type="time"
                        {...register("open_time", {
                          required: "Opening time is required",
                        })}
                      />
                      {errors.open_time && (
                        <span className="text-red-500 text-sm">
                          {errors.open_time.message}
                        </span>
                      )}
                    </div>

                    <div>
                     <Label htmlFor="close_time">Jam Tutup  <span className="text-xs font-light text-red-500">
              (Jika libur, atur waktu 00:01)
            </span></Label>
                      <Input
                        id="close_time"
                        type="time"
                        {...register("close_time", {
                          required: "Closing time is required",
                          validate: (value) => {
                            if (
                              watch("open_time") &&
                              value <= watch("open_time")
                            ) {
                              return "Closing time must be after opening time";
                            }
                          },
                        })}
                      />
                      {errors.close_time && (
                        <span className="text-red-500 text-sm">
                          {errors.close_time.message}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="location_url">Google Maps URL</Label>
                      <TutorialDialog umkmData={umkmData} />
                    </div>
                    <Input
                      id="location_url"
                      {...register("location_url", {
                        required: "Google Maps Embed URL is required",
                        pattern: {
                          value: /^<iframe.+<\/iframe>$/i, // Hanya menerima iframe
                          message: "Only Google Maps embed iframe is allowed",
                        },
                      })}
                      aria-invalid={errors.location_url ? "true" : "false"}
                    />
                    {errors.location_url && (
                      <span className="text-red-500 text-sm">
                        {errors.location_url.message}
                      </span>
                    )}
                    {watch("location_url") && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">
                          Google Maps Preview:
                        </h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: watch("location_url"),
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="password">Password (opsional)</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password", {
                        minLength: {
                          value: 8,
                          message:
                            "Password must be at least 8 characters long",
                        },
                      })}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    {errors.password && (
                      <span className="text-red-500 text-sm">
                        {errors.password.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>UMKM Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  {imagePreviews.length > 0 ? (
                    imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    ))
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <Upload className="text-gray-400" />
                    </div>
                  )}
                </div>
                <Label htmlFor="images" className="cursor-pointer">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    {...register("images")}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Pilih Foto UMKM
                  </span>
                </Label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>UMKM Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  {documentPreview ? (
                    <img
                      src={documentPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <Upload className="text-gray-400" />
                    </div>
                  )}
                </div>
                <Label htmlFor="document" className="cursor-pointer">
                  <Input
                    id="document"
                    type="file"
                    accept="image/*,application/pdf"
                    {...register("document")}
                    onChange={handleDocumentChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Pilih Dokumen UMKM
                  </span>
                </Label>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing || !isDirty}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update UMKM"
          )}
        </Button>
      </form>
    </>
  );
}
