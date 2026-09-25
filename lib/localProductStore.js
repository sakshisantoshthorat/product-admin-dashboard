const ADDED_PRODUCTS_KEY = "addedProducts";
const UPDATED_PRODUCTS_KEY = "updatedProducts";
const DELETED_PRODUCTS_KEY = "deletedProducts";

export const getAddedProducts = () => {
    return JSON.parse(
        localStorage.getItem(ADDED_PRODUCTS_KEY) || "[]"
    );
};

export const saveAddedProduct = (product) => {
    const products = getAddedProducts();

    products.push(product);

    localStorage.setItem(
        ADDED_PRODUCTS_KEY,
        JSON.stringify(products)
    );
};

export const getUpdatedProducts = () => {
    return JSON.parse(
        localStorage.getItem(UPDATED_PRODUCTS_KEY) || "{}"
    );
};

export const saveUpdatedProduct = (product) => {
    const products = getUpdatedProducts();

    products[product.id] = product;

    localStorage.setItem(
        UPDATED_PRODUCTS_KEY,
        JSON.stringify(products)
    );
};

export const getDeletedProducts = () => {
    return JSON.parse(
        localStorage.getItem(DELETED_PRODUCTS_KEY) || "[]"
    );
};

export const saveDeletedProduct = (id) => {
    const deletedProducts = getDeletedProducts();

    if (!deletedProducts.includes(id)) {
        deletedProducts.push(id);
    }

    localStorage.setItem(
        DELETED_PRODUCTS_KEY,
        JSON.stringify(deletedProducts)
    );
};