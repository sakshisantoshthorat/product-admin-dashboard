import api from "./axios";

export const getProducts = async (
    limit = 10,
    skip = 0,
    sortBy = "",
    order = "asc"
) => {
    const response = await api.get("/products", {
        params: {
            limit,
            skip,
            ...(sortBy && { sortBy, order }),
        },
    });

    return response.data;
};

export const searchProducts = async (
    query,
    limit = 10,
    skip = 0,
    sortBy = "",
    order = "asc",
    signal
) => {
    const response = await api.get("/products/search", {
        params: {
            q: query,
            limit,
            skip,
            ...(sortBy && { sortBy, order }),
        },
        signal,
    });

    return response.data;
};

export const getProductsByCategory = async (
    category,
    limit = 10,
    skip = 0,
    sortBy = "",
    order = "asc"
) => {
    const response = await api.get(
        `/products/category/${encodeURIComponent(category)}`,
        {
            params: {
                limit,
                skip,
                ...(sortBy && { sortBy, order }),
            },
        }
    );

    return response.data;
};

export const getCategories = async () => {
    const response = await api.get("/products/categories");

    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);

    return response.data;
};

export const addProduct = async (productData) => {
    const response = await api.post("/products/add", productData);

    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.patch(`/products/${id}`, productData);

    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);

    return response.data;
};