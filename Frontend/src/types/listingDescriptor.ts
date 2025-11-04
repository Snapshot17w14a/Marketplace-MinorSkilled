import type { ListingImage } from "./listingImage";

export type ListingDescriptor = {
    images: ListingImage[],
    title: string,
    description: string,
    price: number,
    currency: string,
    createdAt: string,
    guid: string,
}