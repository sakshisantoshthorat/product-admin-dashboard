"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm from "@/components/ProductForm";

import {
    getProductById,
    updateProduct,
    deleteProduct
} from "@/lib/productApi";

import {
    getAddedProducts,
    getUpdatedProducts,
    saveUpdatedProduct,
} from "@/lib/localProductStore";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/login");
            return;
        }

        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");

                // Check locally updated products first
                const updatedProducts = getUpdatedProducts();

                if (updatedProducts[String(params.id)]) {
                    setProduct(updatedProducts[String(params.id)]);
                    return;
                }

                // Check locally added products
                const addedProducts = getAddedProducts();

                const localProduct = addedProducts.find(
                    (item) => Number(item.id) === Number(params.id)
                );

                if (localProduct) {
                    setProduct(localProduct);
                    return;
                }

                // If not found locally, get it from DummyJSON
                const data = await getProductById(params.id);
                setProduct(data);
            } catch (error) {
                console.error(error);

                if (error.response?.status === 404) {
                    setError("Product not found.");
                } else {
                    setError("Failed to load product.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [params.id, router]);

    const handleUpdateProduct = async (productData) => {
        try {
            setSaving(true);
            setError("");

            const addedProducts = getAddedProducts();

            const isLocalProduct = addedProducts.some(
                (item) => Number(item.id) === Number(params.id)
            );

            let finalProduct;

            if (isLocalProduct) {
                // Locally added product: update it locally
                finalProduct = {
                    ...product,
                    ...productData,
                };
            } else {
                // Existing DummyJSON product: update through API
                const updatedProduct = await updateProduct(
                    params.id,
                    productData
                );

                finalProduct = {
                    ...product,
                    ...productData,
                    ...updatedProduct,
                };
            }

            saveUpdatedProduct(finalProduct);

            router.push(`/products/${params.id}`);
        } catch (error) {
            console.error(error);
            setError(
                "Failed to update product. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-gray-700">
                    Loading product...
                </p>
            </main>
        );
    }

    if (error && !product) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
                <div className="rounded-lg bg-white p-8 text-center shadow">
                    <p className="mb-4 text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={() => router.push("/products")}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white"
                    >
                        Back to Products
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Edit Product
                    </h1>

                    <button
                        onClick={() =>
                            router.push(`/products/${params.id}`)
                        }
                        className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
                    >
                        Back
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
                        {error}
                    </div>
                )}

                {/* Form */}
                <ProductForm
                    initialData={product}
                    onSubmit={handleUpdateProduct}
                    loading={saving}
                    buttonText="Update Product"
                />

            </div>
        </main>
    );
}