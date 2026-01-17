import { useState, useEffect } from "react";
import { useNotify } from "../Components/NotificationProvider";
import ProductCard from "../Components/ProductCard";
import { getSavedListingDescriptors } from "../SavedListings";
import type { ListingDescriptor } from "../types/listingDescriptor";

export default function Saves() {

    const [savedListings, setSavedListings] = useState<ListingDescriptor[] | null>(null);

    const notify = useNotify();

    useEffect(() => {
        getSavedListingDescriptors()
            .then(data => {
                setSavedListings(data)
            })
            .catch(reason => notify({
                header: 'Failed to fetch saved listing data',
                message: `${reason}`,
                type: 'error'
            }));
    }, [])

    return(
        <>
            <h2 className="text-4xl font-bold mb-8">Saved listings</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-fit mx-auto">
                {savedListings &&
                    savedListings.map((descriptor, index) => {
                        return <ProductCard descriptor={descriptor} key={index} />
                    })
                }
            </div>
        </>
    )
}