import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { getAnonymous } from "../BackendClient";
import endpointsConfig from "../Configs/endpoints.config";
import Logo from '../assets/Subtract.svg';
import { GetCurrentActiveUser, IsLoggedIn } from "../Auth";
import Button from "../Components/Button";
import type { ListingDescriptor } from "../types/listingDescriptor";
import type { ListingImage } from "../types/listingImage";

export default function Listing() {
    
    const {listingId} = useParams();
    
    const [listingGuid, setListingGuid] = useState<string | null>(null);
    const [listingData, setListingData] = useState<ListingDescriptor | null>(null);

    useEffect(() => {
        setListingGuid(listingId ?? "");
    }, [listingId])

    useEffect(() => {
        if (!listingGuid) return; 
        
        const fetchData = async () => {
            const data = await getAnonymous<ListingDescriptor>(`Listings/Get/${listingGuid}`)
            setListingData(data);
        };

        fetchData();

    }, [listingGuid])

    useEffect(() => {
        console.log(listingData);
        console.log(listingId);
    }, [listingData]);
    
    return(
        <>
        {listingData ? 
            <div className="w-screen h-screen flex lg:flex-row flex-col gap-2 p-2">
                <ListingNav className="lg:hidden"/>
                <ImageRoulette images={listingData.images} className="basis-2/3 min-h-1/2 overflow-hidden overflow-y-clip grow-0 bg-(--mid-dark) ring-2 ring-(--light-dark) rounded-lg z-10"/>
                <div className="basis-1/3 flex flex-col">
                    <ListingNav className="hidden lg:flex mb-2"/>
                    <div className=" basis-full p-2 mt-6">
                        <h1 className="text-4xl font-bold mb-4">{listingData.title}</h1>
                        <h2 className="text-2xl font-light mb-4">{`${listingData.price} ${listingData.currency}`}</h2>
                        <h3 className="text-[#888888] mb-4">Listed at: {listingData.createdAt}</h3>
                        <div className="flex justify-evenly gap-4 mb-4">
                            <Button className="basis-4/6 px-2 py-1.5" variant="filled">Message</Button>
                            <Button className="basis-1/6 px-2 py-1">Save</Button>
                            <Button className="basis-1/6 px-2 py-1">Share</Button>
                        </div>
                        <div className="w-full h-1 bg-(--light-dark) rounded-lg mb-4"></div>
                        <h1 className="text-4xl font-bold mb-4">Description</h1>
                        <p className="mb-4">{listingData.description}</p>
                        <div className="w-full h-1 bg-(--light-dark) rounded-lg mb-4"></div>
                    </div>
                </div>
            </div>
        :   <></>}
        </>
    )
}

function ImageRoulette({ images, className } : { images: ListingImage[] | undefined, className?: string }){

    const [index, setIndex] = useState<number>(0);

    return(
        <div className={"relative " + className}>
            <div className="absolute w-full h-full flex justify-center items-center z-1">
                <Button variant="filled" className="absolute top-2 left-2 font-bold py-1 px-2" onClick={() => history.back()}>Back</Button>
                <div className="flex justify-between w-full p-2">
                    {images && images.length > 1 && 
                    <>
                        <Button className="px-2 py-1" onClick={() => setIndex(prev => (prev - 1  + images.length) % images.length)}>🡐</Button>
                        <Button className="px-2 py-1" onClick={() => setIndex(prev => (prev + 1) % images.length)}>🡒</Button>
                    </>
                    }
                </div>
            </div>
            <div className="flex flex-nowrap h-full overflow-x-visible will-change-transform transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${index * 100}%)`}} >
                {images && images.map((img, index) => {
                    return(
                        <div className="lg:h-screen w-full flex shrink-0 justify-center items-center">
                            <img className="object-contain h-full" src={endpointsConfig.BackendStaticUrl + img.relativePath} key={index}/>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function ListingNav({ className = '' }){

    const navigate = useNavigate();

    return(
        <div className={"bg-(--mid-dark) ring-2 ring-(--light-dark) rounded-lg h-16 flex justify-between items-center drop-shadow-2xl drop-shadow-rose-500/50 " + className}>
            <button className="p-2 h-full cursor-pointer" type="button" onClick={() => navigate("/")}>
                <img className="h-full object-contain" src={Logo}></img>
            </button>
            {IsLoggedIn() ? 
                <p className="mr-2 text-xl">Logged in as {GetCurrentActiveUser()?.username}</p> :
                <Button className="p-2 mr-2" variant="filled" type="button" onClick={() => navigate('/account/login')}>Log in</Button>
            }
        </div>
    )
}