import { useNavigate } from "react-router-dom";
import Button from "./Button";
import endpointsConfig from "../Configs/endpoints.config";
import type { ListingDescriptor } from "../types/listingDescriptor";

export default function ListingCard({ descriptor, className }: { descriptor?: ListingDescriptor, className?: string }) {

    const navigate = useNavigate();

    return(
        <div className={"bg-(--dark) border-2 border-(--light-dark) rounded-lg sm:w-sm w-72 relative " + className} >
            <div className="h-3/5 object-contain flex justify-center rounded-lg m-2 bg-(--mid-dark) border-2 border-(--light-dark)">
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
            <div className="flex justify-center">
                <Button className="px-2 py-1" onClick={() => navigate(`/listing/${descriptor!.guid}`)}>To listing</Button>
            </div>
        </div>
    )
}