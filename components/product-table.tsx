"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit,
  Trash2,
  LayoutGrid,
  LayoutList,
  Eye,
  EyeOff,
} from "lucide-react";
import { Modal } from "./ui/modal";
import { AddProductForm } from "./add-product-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardView, setIsCardView] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // 🔥 State untuk loading perubahan
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // 🔥 Produk yang diedit
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]); // 🔥 Pastikan fetchProducts dipanggil setelah token ada

  const fetchProducts = async () => {
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      console.log("Fetching UMKM data...");
      const umkmRes = await axios.get(`${API_BASE_URL}/api/umkm/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("UMKM data:", umkmRes.data);
      const umkmId = umkmRes.data.id;

      console.log("Fetching products...");
      const productRes = await axios.get(
        `${API_BASE_URL}/api/umkms/${umkmId}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Products fetched:", productRes.data);
      setProducts(productRes.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addProduct = async (newProduct: Omit<Product, "id">) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const umkmRes = await axios.get(`${API_BASE_URL}/api/umkm/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const umkmId = umkmRes.data.id;

      const res = await axios.post(
        `${API_BASE_URL}/api/umkms/${umkmId}/products`,
        newProduct,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProducts([...products, res.data.product]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const updateProduct = async (
    updatedProduct: Product,
    imageFile: File | null
  ) => {
    try {
      setIsProcessing(true);
      if (!token) return;

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", updatedProduct.name);
      formData.append("description", updatedProduct.description);
      formData.append("price", updatedProduct.price.toString());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/products/${updatedProduct.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 🔥 Update produk di state agar UI diperbarui dengan data terbaru
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id
            ? { ...product, ...response.data.product }
            : product
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const EditProductForm = ({ product }: { product: Product }) => {
    const [formData, setFormData] = useState<Product>({ ...product });

    const [imagePreview, setImagePreview] = useState<string | null>(
      product.image ? `${API_BASE_URL}${product.image}` : null
    );
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };
    const formatRupiah = (value: string) => {
      return (
        "Rp. " + value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      );
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka
      setFormData((prev) => ({
        ...prev,
        price: rawValue ? parseFloat(rawValue) : 0, // Simpan sebagai number
      }));
    };

    const formatPriceDisplay = (price: number) => {
      return "Rp. " + price.toLocaleString("id-ID").replace(/,/g, ".");
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateProduct(formData, selectedImage); // Kirim `formData` yang terbaru!
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="image">Gambar</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Selected Product"
              className="mt-2 w-32 h-32 object-cover rounded-md"
            />
          ) : (
            <img
              src={`${API_BASE_URL}/storage/${formData.image}`}
              alt="Current Product"
              className="mt-2 w-32 h-32 object-cover rounded-md"
            />
          )}
        </div>
        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <Input
          id="price"
          name="price"
          type="text"
          value={formatPriceDisplay(formData.price)} // Format tampilan Rupiah
          onChange={handlePriceChange}
        />

        <Button type="submit" disabled={isProcessing} className="w-full">
          {isProcessing ? "Updating..." : "Update Product"}
        </Button>
      </form>
    );
  };

  const deleteProduct = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const renderTableView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {/* <TableHead className="w-[100px]">ID</TableHead> */}
          <TableHead>Nama</TableHead>
          {showDescription && <TableHead>Deskripsi</TableHead>}
          <TableHead>Harga</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            {/* <TableCell className="font-medium">{product.id}</TableCell> */}
            <TableCell>{product.name}</TableCell>
            {showDescription && <TableCell>{product.description}</TableCell>}
            <TableCell>
              {"Rp. " +
                Math.floor(product.price)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {showDescription && <p>{product.description}</p>}
            <p className="font-bold mt-2">
              {"Rp. " +
                Math.floor(product.price)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProduct(product);
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteProduct(product.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Hapus
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 className="text-lg font-semibold">Produk</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDescription(!showDescription)}
          >
            {showDescription ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {showDescription ? "Hide" : "Show"} Deskripsi
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCardView(!isCardView)}
          >
            {isCardView ? (
              <LayoutList className="mr-2 h-4 w-4" />
            ) : (
              <LayoutGrid className="mr-2 h-4 w-4" />
            )}
            {isCardView ? "Table" : "Card"} View
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
          </Button>
        </div>
      </div>
      {isCardView ? renderCardView() : renderTableView()}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambahkan Produk Baru"
      >
        <AddProductForm
          onAdd={addProduct}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      {isEditModalOpen && selectedProduct && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Product"
        >
          <EditProductForm key={selectedProduct.id} product={selectedProduct} />
        </Modal>
      )}
    </div>
  );
}
