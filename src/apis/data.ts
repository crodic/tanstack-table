import { Product } from '@/types/product';
import QueryString from 'qs';

interface ResponseType {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

export const getAllProductsClient = async ({
    title,
    page,
    limit,
    sortBy,
    order,
}: {
    title?: string;
    page: string;
    limit: string;
    sortBy?: string;
    order?: string;
}): Promise<ResponseType> => {
    const skip = (+page - 1) * +limit;
    const queryString = QueryString.stringify(
        { title, skip, limit, sortBy, order },
        {
            filter: (prefix, value) => value || undefined,
            arrayFormat: 'comma',
        }
    );
    const res = await fetch(`https://dummyjson.com/products?${queryString}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return res.json();
};

export const getProducts = async (): Promise<ResponseType> => {
    const res = await fetch('https://dummyjson.com/products', { next: { revalidate: 60 } });
    return res.json();
};
