import type { ListingCategory } from "./listingCategory";
import type { ListingImage } from "./listingImage";

export type ListingDescriptor = {
    images: ListingImage[],
    categories: ListingCategory[],
    userId: string,
    title: string,
    description: string,
    price: number,
    currency: string,
    createdAt: string,
    listingId: string
}