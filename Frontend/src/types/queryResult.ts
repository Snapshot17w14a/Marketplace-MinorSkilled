import type { ListingDescriptor } from "./listingDescriptor"

export type QueryResult = {
    listings: ListingDescriptor[],
    page: number,
    pageCount: number,
    listingCount: number
}