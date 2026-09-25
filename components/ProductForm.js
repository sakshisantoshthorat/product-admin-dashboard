"use client";

import { useState } from "react";

export default function ProductForm({
    initialData = {},
    onSubmit,
    loading = false,
    buttonText = "Save Product",
}) {
    const [formData, setFormData] = useState({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        price: initialData.price ?? "",
        stock: initialData.stock ?? "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required.";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required.";
        }

        if (!formData.category.trim()) {
            newErrors.category = "Category is required.";
        }

        if (formData.price === "") {
            newErrors.price = "Price is required.";
        } else if (Number(formData.price) < 0) {
            newErrors.price = "Price cannot be negative.";
        }

        if (formData.stock === "") {
            newErrors.stock = "Stock is required.";
        } else if (
            Number(formData.stock) < 0 ||
            !Number.isInteger(Number(formData.stock))
        ) {
            newErrors.stock = "Stock must be a non-negative integer.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        onSubmit({
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-lg bg-white p-6 shadow"
        >
            {/* Title */}
            <div>
                <label
                    htmlFor="title"
                    className="mb-1 block font-medium text-gray-700"
                >
                    Title
                </label>

                <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Enter product title"
                />

                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.title}
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <label
                    htmlFor="description"
                    className="mb-1 block font-medium text-gray-700"
                >
                    Description
                </label>

                <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Enter product description"
                />

                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                    </p>
                )}
            </div>

            {/* Category */}
            <div>
                <label
                    htmlFor="category"
                    className="mb-1 block font-medium text-gray-700"
                >
                    Category
                </label>

                <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Enter category"
                />

                {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.category}
                    </p>
                )}
            </div>

            {/* Price */}
            <div>
                <label
                    htmlFor="price"
                    className="mb-1 block font-medium text-gray-700"
                >
                    Price
                </label>

                <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Enter price"
                />

                {errors.price && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.price}
                    </p>
                )}
            </div>

            {/* Stock */}
            <div>
                <label
                    htmlFor="stock"
                    className="mb-1 block font-medium text-gray-700"
                >
                    Stock
                </label>

                <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
                    placeholder="Enter stock"
                />

                {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.stock}
                    </p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Saving..." : buttonText}
            </button>
        </form>
    );
}