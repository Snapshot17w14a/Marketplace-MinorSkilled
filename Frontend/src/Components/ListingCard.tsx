import { useNavigate } from "react-router-dom";
import Button from "./Button";

export default function ListingCard({ descriptor }: { descriptor?: ListingDescriptor }) {

    const navigate = useNavigate();

    return(
        <div className="bg-(--dark) border-2 border-(--light-dark) rounded-lg last:m-0 mr-2 h-full w-sm relative">
            <div className="h-1/2 object-contain flex justify-center rounded-lg m-2 bg-(--mid-dark) border-2 border-(--light-dark)">
                <img className="h-full" src={descriptor?.imageSource}></img>
            </div>
            <div className="font-bold text-2xl flex justify-between h-min">
                <h1 className="mx-4">{descriptor?.title}</h1>
                <h1 className="mx-4">{descriptor?.price}</h1>
            </div>
            <p className="text-start mx-4 my-2">{descriptor?.description}</p>
            <div className="h-min">
                <Button className="px-2 py-1" onClick={() => navigate(descriptor!.url)}>To listing</Button>
            </div>
        </div>
    )
}

export type ListingDescriptor = {
    imageSource: string,
    title: string,
    price: number,
    description: string,
    url: string
}