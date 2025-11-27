import type { ListingImage } from "./listingImage";

export type ListingDescriptor = {
    images: ListingImage[],
    userId: string,
    title: string,
    description: string,
    price: number,
    currency: string,
    createdAt: string,
    listingId: string,
}