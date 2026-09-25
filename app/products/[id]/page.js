"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getProductById,
    deleteProduct,
} from "@/lib/productApi";
import {
    getAddedProducts,
    getUpdatedProducts,
    saveDeletedProduct,
} from "@/lib/localProductStore";

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
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

                const updatedProducts = getUpdatedProducts();

                if (updatedProducts[String(params.id)]) {
                    setProduct(updatedProducts[String(params.id)]);
                    return;
                }

                const addedProducts = getAddedProducts();

                const localProduct = addedProducts.find(
                    (item) => Number(item.id) === Number(params.id)
                );

                if (localProduct) {
                    setProduct(localProduct);
                    return;
                }

                // If product is not stored locally, get it from DummyJSON
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


    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const addedProducts = getAddedProducts();

            const isLocalProduct = addedProducts.some(
                (item) => Number(item.id) === Number(product.id)
            );

            if (!isLocalProduct) {
                await deleteProduct(product.id);
            }

            saveDeletedProduct(product.id);

            router.push("/products");
        } catch (error) {
            console.error(error);
            setError("Failed to delete product. Please try again.");
        }
    };


    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-700">
                    Loading product...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
                <div className="rounded-lg bg-white p-8 text-center shadow">
                    <h1 className="mb-3 text-2xl font-bold text-red-600">
                        {error}
                    </h1>

                    <div className="flex gap-3">

                        <button
                            onClick={() => router.push("/products")}
                            className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Product Details
                    </h1>

                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push(`/products/${product.id}/edit`)}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Edit
                        </button>

                        <button
                            onClick={handleDelete}
                            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                            Delete
                        </button>

                        <button
                            onClick={() => router.push("/products")}
                            className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-800"
                        >
                            Back
                        </button>
                    </div>
                </div>
                {/* Product */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="grid gap-8 md:grid-cols-2">

                        {/* Product Image */}
                        <div className="flex items-center justify-center rounded-lg bg-gray-50 p-6">
                            <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="max-h-96 w-full object-contain"
                            />
                        </div>

                        {/* Product Information */}
                        <div>
                            <h2 className="mb-3 text-3xl font-bold text-gray-900">
                                {product.title}
                            </h2>

                            <p className="mb-5 text-gray-600">
                                {product.description}
                            </p>

                            <div className="space-y-3 text-gray-800">
                                <p>
                                    <span className="font-semibold">Category:</span>{" "}
                                    {product.category}
                                </p>

                                <p>
                                    <span className="font-semibold">Price:</span>{" "}
                                    ${product.price}
                                </p>

                                <p>
                                    <span className="font-semibold">Rating:</span>{" "}
                                    ⭐ {product.rating}
                                </p>

                                <p>
                                    <span className="font-semibold">Stock:</span>{" "}
                                    {product.stock}
                                </p>

                                <p>
                                    <span className="font-semibold">Brand:</span>{" "}
                                    {product.brand || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="mt-10">
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">
                            Reviews
                        </h2>

                        {product.reviews?.length > 0 ? (
                            <div className="space-y-4">
                                {product.reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-gray-200 p-4"
                                    >
                                        <div className="mb-2 flex justify-between">
                                            <p className="font-semibold text-gray-900">
                                                {review.reviewerName}
                                            </p>

                                            <p>
                                                ⭐ {review.rating}
                                            </p>
                                        </div>

                                        <p className="text-gray-600">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                No reviews available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}