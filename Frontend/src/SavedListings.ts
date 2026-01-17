import { getAuthorized, postAuthorized } from "./BackendClient";
import type { ListingDescriptor } from "./types/listingDescriptor";
import type { SavedListing } from "./types/savedListing";
import type { UserData } from "./types/userData";

var savedListings: SavedListing[] = [];

export function toggleSavedListing(listingId: string): boolean {
    const isSaved = isListingSaved(listingId);

    if(isSaved){
        removeSavedListing(listingId);
    }
    else{
        addSavedListing(listingId);
    }

    return !isSaved;
}

function removeSavedListing(listingId: string) {
    savedListings = savedListings.filter((sl) => sl.listingId != listingId);
    localStorage.setItem('saves', JSON.stringify(savedListings));

    removeSaveBackend(listingId);
}

async function removeSaveBackend(listingId: string) {
    await postAuthorized('Save/RemoveSaveListing', { listingId: listingId });
}

function addSavedListing(listingId: string) {
    savedListings.push({ listingId: listingId })
    localStorage.setItem('saves', JSON.stringify(savedListings));

    void addSaveBackend(listingId);
}

async function addSaveBackend(listingId: string) {
    await postAuthorized('Save/SaveListing', { listingId: listingId });
}

export function getSavedListings() {
    return savedListings;
}

export function isListingSaved(listingId: string): boolean {
    return savedListings.some(sl => sl.listingId === listingId);
}

export async function fetchSavedListings(user: UserData) {
    savedListings = JSON.parse(localStorage.getItem('saves') ?? "[]");


    savedListings = await getAuthorized<SavedListing[]>(`Save/GetSaves/${user!.identifier}`);
    localStorage.setItem('saves', JSON.stringify(savedListings));
}

export async function getSavedListingDescriptors(): Promise<ListingDescriptor[]> {
    return getAuthorized<ListingDescriptor[]>('save/GetSavedListings');
}