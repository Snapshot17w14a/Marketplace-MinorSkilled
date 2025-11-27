import { useState, useEffect, useRef, type RefObject } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActiveUser, isLoggedIn } from "../Auth";
import { type ListingDescriptor } from "../types/listingDescriptor";
import { getAnonymous, patchAuthorized } from "../BackendClient";
import Button from "../Components/Button";
import Logo from "../assets/Subtract.svg";
import { useNotify } from "../Components/NotificationProvider";
import { FetchError } from "../classes/FetchError";
import type { ListingImage } from "../types/listingImage";
import endpointsConfig from "../Configs/endpoints.config";

export default function EditListing() {
    
    const {listingId} = useParams();

    const [listingGuid, setListingGuid] = useState<string | null>(null);
    const [listingData, setListingData] = useState<ListingDescriptor | null>(null);
    const [imageGuids, setImageGuids] = useState<string[]>([]);

    const titleRef = useRef<HTMLInputElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);
    const currencyRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const navigate = useNavigate();
    const notify = useNotify();

    useEffect(() => {
        setListingGuid(listingId ?? "");
    }, [listingId])

    useEffect(() => {
        if (!listingGuid) return; 
        
        const fetchData = async () => {
            const data = await getAnonymous<ListingDescriptor>(`Listings/Get/${listingGuid}`)
            setListingData(data);
            setImageGuids(data.images.map<string>((img) => {
                return(img.guid)
            }))
        };

        fetchData();

    }, [listingGuid])

    const handleSave = async () => {

        if (!ValidateRefs<HTMLInputElement | null>([titleRef, priceRef, currencyRef]) && !descriptionRef.current)
            return;

        const data = {
            listingGuid: listingId,
            title: titleRef.current!.value,
            price: priceRef.current!.value,
            currency: currencyRef.current!.value,
            description: descriptionRef.current!.value,
            imageGuids: imageGuids
        }

        try{
            await patchAuthorized("Listings/EditListing", data);
        }
        catch (e){
            if (e instanceof(FetchError)){
                notify({
                    header: "Error sending data",
                    message: "An error occured when trying to communicate with the host server. The server may be down. Try again in a few minutes.",
                    type: 'error'
                })
            }
            else{
                notify({
                    header: "Something went wrong!",
                    message: "There was an error trying to update your listing. Please try again later.",
                    type: 'error'
                })
            }

            return;
        }

        notify({
            header: "Saved!",
            message: "The listing was successfully updated!",
            type: 'success'
        });

        navigate(`/listing/${listingId}`);
    }

    const reorderImages = (index1: number, index2: number) => {
        if (index2 < 0 || index2 >= imageGuids.length)
            return;

        const newArr = [...imageGuids];
        const first = newArr[index1];
        newArr[index1] = newArr[index2];
        newArr[index2] = first;
        setImageGuids(newArr);
    }
    
    return(
        <>
        {listingData ? 
            <div className="w-screen h-screen flex lg:flex-row flex-col gap-2 p-2">
                <ListingNav className="lg:hidden"/>
                <div className="basis-2/3 min-h-1/2 overflow-hidden overflow-y-scroll grow-0 bg-(--mid-dark) ring-2 ring-(--light-dark) rounded-lg z-10 p-2 relative">
                    {imageGuids &&
                        imageGuids.map((guid, index) => {
                            return(<ImagePreview img={listingData.images.find(img => img.guid === guid)} index={index} reorder={reorderImages} key={guid}></ImagePreview>)
                        })
                    }
                </div>
                <div className="basis-1/3 flex flex-col">
                    <ListingNav className="hidden lg:flex mb-2"/>
                    <div className=" basis-full p-2 mt-6">
                        <input ref={titleRef} className="textinput-standard w-full font-bold text-2xl mb-4" placeholder={listingData.title} defaultValue={listingData.title}></input>
                        <div className="flex gap-2 w-full mx-0.5 mb-4">
                            <input ref={priceRef} className="textinput-standard basis-1/2" placeholder={`${listingData.price}`} defaultValue={`${listingData.price}`}></input>
                            <input ref={currencyRef} className="textinput-standard basis-1/2" placeholder={listingData.currency} defaultValue={listingData.currency}></input>
                        </div>
                        <h3 className="text-[#888888] mb-4">Listed at: {listingData.createdAt}</h3>
                        <div className="w-full h-1 bg-(--light-dark) rounded-lg mb-4"></div>
                        <h1 className="text-4xl font-bold mb-4">Description</h1>
                        <textarea ref={descriptionRef} className="textinput-standard w-full mb-4" placeholder={listingData.description} defaultValue={listingData.description}></textarea>
                        <div className="w-full h-1 bg-(--light-dark) rounded-lg mb-4"></div>
                        <div className="flex justify-around">
                            <Button className="px-12 py-2 font-bold text-lg" variant="filled" onClick={handleSave}>Save</Button>
                            <Button className="px-12 py-2 font-bold text-lg" variant="standard" onClick={() => navigate(`/listing/${listingId}`)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            </div>
        :   <></>}
        </>
    )
}

function ListingNav({ className = '' }){

    const navigate = useNavigate();

    return(
        <div className={"bg-(--mid-dark) ring-2 ring-(--light-dark) rounded-lg h-16 flex justify-between items-center drop-shadow-2xl drop-shadow-rose-500/50 " + className}>
            <button className="p-2 h-full cursor-pointer" type="button" onClick={() => navigate("/")}>
                <img className="h-full object-contain" src={Logo}></img>
            </button>
            {isLoggedIn() ? 
                <p className="mr-2 text-xl">Logged in as {getActiveUser()?.username}</p> :
                <Button className="p-2 mr-2" variant="filled" type="button" onClick={() => navigate('/account/login')}>Log in</Button>
            }
        </div>
    )
}

function ImagePreview({ img, index, reorder } : { img: ListingImage | undefined, index: number, reorder: (index1: number, index2: number) => void }){

    return(
        <div className="w-full h-96 ring-2 ring-(--light-dark) rounded-lg mb-2 last:mb-0 flex">
            <div className="flex flex-col text-center justify-center mx-2">
                <Button className='size-12 px-3 py-1 font-bold' onClick={() => reorder(index, index - 1)}>🡑</Button>
                <p className="my-2 font-bold text-2xl">{index + 1}</p>
                <Button className='size-12 px-3 py-1 font-bold' onClick={() => reorder(index, index + 1)}>🡓</Button>
            </div>
            <div className="py-2">
                <img className="bg-(--dark) ring-2 ring-(--light-dark) rounded-lg h-full aspect-video object-contain" src={endpointsConfig.BackendStaticUrl + img?.relativePath}/>
            </div>
        </div>
    )
}

function ValidateRefs<T>(refs: RefObject<T>[]): boolean {
    return refs.every((obj) => obj.current != null);
}