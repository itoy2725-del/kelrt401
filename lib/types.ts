export interface Product {
    id: number;
    sku: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    regular_price: number;
    brand_name: string;
    category_name: string;
    image_url: string;
    images: string[] | string;
    in_stock: boolean;
    discount_badge: string | null;
    json_data: any;
    is_flash_sale: boolean;
    stock_limit: number | null;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    image_url: string;
    slug: string;
}

export interface CartItem {
    id: number;
    product_id: number;
    amount: number;
    product: Product;
}