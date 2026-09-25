"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getProducts, searchProducts, getProductsByCategory,
  getCategories
} from "@/lib/productApi";

import {
  getAddedProducts,
  getUpdatedProducts,
  getDeletedProducts,
} from "@/lib/localProductStore";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read page and limit from the URL
  const pageParam = Number(searchParams.get("page"));
  const limitParam = Number(searchParams.get("limit"));
  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "";

  const sortByParam = searchParams.get("sortBy") || "";
  const orderParam = searchParams.get("order") || "asc";

  // Validate page
  const page =
    Number.isInteger(pageParam) && pageParam > 0
      ? pageParam
      : 1;

  // Validate page size
  const allowedLimits = [10, 20, 50];

  const limit = allowedLimits.includes(limitParam)
    ? limitParam
    : 10;

  const allowedSortFields = ["price", "rating", "title"];

  const sortBy = allowedSortFields.includes(sortByParam)
    ? sortByParam
    : "";

  const order = orderParam === "desc" ? "desc" : "asc";

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = searchInput.trim();

      if (trimmedSearch === searchQuery) {
        return;
      }

      const params = new URLSearchParams();

      params.set("page", "1");
      params.set("limit", String(limit));

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      router.push(`/products?${params.toString()}`);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput, searchQuery, limit, router]);

  // Calculate how many products to skip
  const skip = (page - 1) * limit;

  // Calculate total number of pages
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        let data;

        if (searchQuery) {
          data = await searchProducts(
            searchQuery,
            limit,
            skip,
            sortBy,
            order,
            controller.signal
          );
        } else if (categoryQuery) {
          data = await getProductsByCategory(
            categoryQuery,
            limit,
            skip,
            sortBy,
            order
          );
        } else {
          data = await getProducts(
            limit,
            skip,
            sortBy,
            order
          );
        }

        const addedProducts = getAddedProducts();
        const updatedProducts = getUpdatedProducts();
        const deletedProducts = getDeletedProducts();

        let updatedProductList = data.products
          .map((product) => {
            return updatedProducts[product.id] || product;
          })
          .filter((product) => {
            return !deletedProducts.includes(product.id);
          });

        // Show locally added products on the main product list
        if (!searchQuery && !categoryQuery) {
          const visibleAddedProducts = addedProducts
            .map((product) => updatedProducts[product.id] || product)
            .filter((product) => !deletedProducts.includes(product.id));

          updatedProductList = [
            ...visibleAddedProducts,
            ...updatedProductList,
          ];
        }

        setProducts(updatedProductList);
        setTotal(
          data.total -
          deletedProducts.length +
          addedProducts.length
        );

        const updatedTotal =
          data.total -
          deletedProducts.length +
          addedProducts.length;

        const maximumPage = Math.max(
          1,
          Math.ceil(updatedTotal / limit)
        );

        if (page > maximumPage) {
          const params = new URLSearchParams();

          params.set("page", String(maximumPage));
          params.set("limit", String(limit));

          if (searchQuery) {
            params.set("search", searchQuery);
          }

          if (categoryQuery) {
            params.set("category", categoryQuery);
          }

          if (sortBy) {
            params.set("sortBy", sortBy);
            params.set("order", order);
          }

          router.replace(`/products?${params.toString()}`);
        }
      } catch (error) {
        if (error.name === "CanceledError") {
          return;
        }

        if (error.code === "ERR_CANCELED") {
          return;
        }

        console.error(error);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [router, page, limit, skip, searchQuery, categoryQuery,
    sortBy,
    order]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/login");
  };

  // Change page
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(newPage));
    params.set("limit", String(limit));

    router.push(`/products?${params.toString()}`);
  };

  const handleLimitChange = (event) => {
    const newLimit = Number(event.target.value);

    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");
    params.set("limit", String(newLimit));

    router.push(`/products?${params.toString()}`);
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-700">
          Loading products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate the displayed range
  const startItem = total === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + products.length, total);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Product Dashboard
            </h1>

            <p className="text-sm text-gray-600">
              Manage your products
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/products/new")}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              + Add Product
            </button>

            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">

          {/* Search */}
          <div className="flex-1">
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Search products
            </label>

            <input
              id="search"
              type="text"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="category"
              value={searchQuery ? "" : categoryQuery}
              disabled={Boolean(searchQuery)}
              onChange={(event) => {
                const newCategory = event.target.value;

                const params = new URLSearchParams();

                params.set("page", "1");
                params.set("limit", String(limit));

                if (newCategory) {
                  params.set("category", newCategory);
                }

                if (sortBy) {
                  params.set("sortBy", sortBy);
                  params.set("order", order);
                }

                router.push(`/products?${params.toString()}`);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 disabled:bg-gray-100"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category.slug}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label
              htmlFor="sort"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Sort
            </label>

            <select
              id="sort"
              value={sortBy ? `${sortBy}-${order}` : ""}
              onChange={(event) => {
                const value = event.target.value;

                const params = new URLSearchParams();

                params.set("page", "1");
                params.set("limit", String(limit));

                if (searchQuery) {
                  params.set("search", searchQuery);
                }

                if (categoryQuery && !searchQuery) {
                  params.set("category", categoryQuery);
                }

                if (value) {
                  const [newSortBy, newOrder] = value.split("-");

                  params.set("sortBy", newSortBy);
                  params.set("order", newOrder);
                }

                router.push(`/products?${params.toString()}`);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value="">Sort by</option>

              <option value="price-asc">
                Price: Low to High
              </option>

              <option value="price-desc">
                Price: High to Low
              </option>

              <option value="rating-desc">
                Rating: High to Low
              </option>

              <option value="rating-asc">
                Rating: Low to High
              </option>

              <option value="title-asc">
                Title: A to Z
              </option>

              <option value="title-desc">
                Title: Z to A
              </option>
            </select>
          </div>
          {/* Showing text */}
          <p className="text-sm text-gray-700">
            Showing {startItem}–{endItem} of {total}
          </p>

          {/* Page size */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="pageSize"
              className="text-sm text-gray-700"
            >
              Page size:
            </label>

            <select
              id="pageSize"
              value={limit}
              onChange={handleLimitChange}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Empty state */}
        {products.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center">
            <p className="text-gray-700">
              No products found.
            </p>
          </div>
        ) : (
          <>
            {/* Product table */}
            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="w-full text-left">

                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-gray-700">
                      Image
                    </th>

                    <th className="px-4 py-3 text-gray-700">
                      Title
                    </th>

                    <th className="px-4 py-3 text-gray-700">
                      Category
                    </th>

                    <th className="px-4 py-3 text-gray-700">
                      Price
                    </th>

                    <th className="px-4 py-3 text-gray-700">
                      Rating
                    </th>

                    <th className="px-4 py-3 text-gray-700">
                      Stock
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {product.title}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {product.category}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        ${product.price}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {product.rating}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {product.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              {!loading && !error && products.length === 0 && (
                <div className="rounded-lg bg-white p-10 text-center shadow">
                  <p className="text-lg font-medium text-gray-700">
                    No products found.
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Try changing your search or filter.
                  </p>
                </div>
              )}
              {/* Mobile Product Cards */}
              <div className="space-y-4 md:hidden">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg bg-white p-4 shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={product.thumbnail || product.images?.[0]}
                        alt={product.title}
                        className="h-20 w-20 rounded object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {product.title}
                        </button>

                        <p className="mt-1 text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium">${product.price}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Rating</p>
                        <p className="font-medium">{product.rating}</p>
                      </div>

                      <div>
                        <p className="text-gray-500">Stock</p>
                        <p className="font-medium">{product.stock}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">

              {/* Previous */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`rounded-md px-3 py-2 text-sm ${pageNumber === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>

            </div>
          </>
        )}
      </div>
    </main>
  );
}
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}