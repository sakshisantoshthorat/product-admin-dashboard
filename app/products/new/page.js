"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { addProduct } from "@/lib/productApi";
import { saveAddedProduct } from "@/lib/localProductStore";

export default function AddProductPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAddProduct = async (productData) => {
        try {
            setLoading(true);
            setError("");

            const newProduct = await addProduct(productData);

            saveAddedProduct(newProduct);

            router.push("/products");
        } catch (error) {
            console.error(error);
            setError("Failed to add product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Add Product
                    </h1>

                    <button
                        onClick={() => router.push("/products")}
                        className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
                        {error}
                    </div>
                )}

                <ProductForm
                    onSubmit={handleAddProduct}
                    loading={loading}
                    buttonText="Add Product"
                />
            </div>
        </main>
    );
}