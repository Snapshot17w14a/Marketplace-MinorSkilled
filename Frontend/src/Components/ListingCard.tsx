import { useNavigate } from "react-router-dom";
import Button from "./Button";
import endpointsConfig from "../Configs/endpoints.config";
import type { ListingDescriptor } from "../types/listingDescriptor";
import { addSavedListing, isListingSaved, removeSavedListing } from "../SavedListings";
import { useState } from "react";

export default function ListingCard({ descriptor, className }: { descriptor: ListingDescriptor, className?: string }) {

    const navigate = useNavigate();

    const [isSaved, setIsSaved] = useState<boolean>(isListingSaved(descriptor.guid));

    const toggleSave = () => {
        if (isSaved) {
            removeSavedListing(descriptor.guid);
        }
        else {
            addSavedListing(descriptor.guid);
        }
        setIsSaved(prev => !prev);
    }

    return(
        <div className={"bg-(--dark) border-2 border-(--light-dark) rounded-lg sm:size-96 w-full relative " + className} >
            <div className="h-3/5 object-fill overflow-clip flex justify-center rounded-lg m-2 bg-(--mid-dark) border-2 border-(--light-dark)">
                <img className="h-full" src={`${endpointsConfig.BackendStaticUrl}${descriptor?.images[0].relativePath}`}></img>
            </div>
            <div className="font-bold text-2xl flex justify-between h-min overflow-clip truncate">
                <h1 className="mx-4 max-w-1/2">{descriptor?.title}</h1>
                <div className="max-w-1/2 text-nowrap">
                    <h1 className="inline-block">{descriptor?.price}</h1>
                    <h1 className="inline-block mr-4 ml-2">{descriptor?.currency}</h1>
                </div>
            </div>
            <p className="text-start mx-4 my-2">{descriptor?.description}</p>
            <div className="flex ml-36 mr-12 justify-between">
                <Button className="px-2 py-1" onClick={() => navigate(`/listing/${descriptor!.guid}`)}>To listing</Button>
                <Button variant={isSaved ? "filled" : "standard"} className="aspect-square w-8 " onClick={toggleSave}>
                    <svg className='w-full h-full' xmlns="http://www.w3.org/2000/svg" viewBox="0,0,256,256">
                        <g fill="#ffffff" fillRule="nonzero" stroke="#ffffff" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor={undefined} style={{mixBlendMode: 'normal'}}><g transform="scale(4,4)"><path d="M41.148,14h-18.296c-0.47,0 -0.852,0.382 -0.852,0.852v32.36c0,0.297 0.357,0.448 0.57,0.241l8.557,-8.303c0.487,-0.472 1.26,-0.472 1.747,0l8.557,8.303c0.212,0.207 0.569,0.056 0.569,-0.24v-32.36c0,-0.471 -0.382,-0.853 -0.852,-0.853zM41.148,10c2.679,0 4.852,2.173 4.852,4.852v37.46c0,1.925 -2.314,2.903 -3.695,1.563l-10.305,-9.998l-10.305,9.999c-1.381,1.34 -3.695,0.361 -3.695,-1.563v-37.46c0,-2.68 2.173,-4.853 4.852,-4.853z"></path></g></g>
                    </svg>
                </Button>
            </div>
        </div>
    )
}