import { useNavigate, useParams } from "react-router-dom"
import type { ListingDescriptor } from "../../types/listingDescriptor";
import { useEffect, useRef, useState } from "react";
import { getAnonymous, postAuthorized } from "../../BackendClient";
import endpointsConfig from "../../Configs/endpoints.config";
import type { ListingImage } from "../../types/listingImage";
import { formatDateString } from "../../CSharpDate";
import Button from "../../Components/Button";
import CategoryLabel from "../../Components/CategoryLabel";
import categoriesConfig from "../../Configs/categories.config";
import DefProfile from '../../assets/DefaultProfile.svg';
import { isListingSaved, toggleSavedListing } from "../../SavedListings";
import type { UserData } from "../../types/userData";
import { useAuth } from "../../Components/AuthProvider";

export default function Listing() {

    const {listingId} = useParams();
    const auth = useAuth();
    const navigate = useNavigate();

    const [listingData, setListingData] = useState<ListingDescriptor>();
    const [listingOwner, setListingOwner] = useState<UserData>();
    const [isSaved, setIsSaved] = useState<boolean>(isListingSaved(listingId!));

    useEffect(() => {

        const fetchData = async () => {
            const listing = await getAnonymous<ListingDescriptor>(`Listings/Get/${listingId}`)
            console.log(listing);
            setListingData(listing);

            const owner = await getAnonymous<UserData>(`users/Get/${listing.userId}`);
            console.log(owner);
            setListingOwner(owner);
        }
        fetchData();
        
    }, [listingId])

    const handleSave = () => {
        setIsSaved(toggleSavedListing(listingId!));
    }

    const handleMessageRequest = async () => {

        console.log(listingOwner);

        await postAuthorized('chat/CreateConversation', {
            listingId: listingId,
            ListingOwnerId: listingOwner?.identifier
        });

        navigate('/management/chats');
    }

    return(
        <div className="mt-14 p-4 gap-4 flex lg:flex-row flex-col">

            <div className='bg-(--mid-dark) basis-2/3 rounded-lg overflow-clip'>
                              
                {listingData && listingData.images.length > 0 ?
                    <ImageRoulette images={listingData.images} /> :
                    <></>
                }
            </div>

            <div className='bg-(--mid-dark) basis-1/3 rounded-lg p-4'>

                <div className="space-y-8">
                    <h1 className="text-4xl font-bold">{listingData?.title}</h1>

                    <p className="text-2xl font-bold">{listingData?.price} {listingData?.currency}</p>

                    <p className="text-neutral-400">Listed on: {formatDateString(listingData?.createdAt || '', 'full')}</p>

                    <fieldset className="flex gap-4 flex-wrap lg:flex-nowrap">

                        {listingData?.userId === auth?.activeUser?.identifier ?
                            <Button className="px-4 flex-2 basis-full lg:basis-0" variant="filled" onClick={() => navigate(`/listing/edit/${listingId}`)}>Edit</Button> :
                            <Button className="px-4 flex-2 basis-full lg:basis-0" variant="filled" onClick={handleMessageRequest}>Message</Button>
                        }

                        <div className="flex flex-1 gap-4">
                            <Button className="px-4 flex-1" variant={isSaved ? 'filled' : 'standard'} onClick={handleSave}>{isSaved ? 'Saved' : 'Save'}</Button>
                            <Button className="px-4 flex-1" variant="standard">Share</Button>
                        </div>
                    </fieldset>

                    {listingData && listingData.categories.length > 0 && <div>
                        <h2 className="text-2xl font-bold mb-2 uppercase font-mono text-neutral-400">Categories</h2>

                        <div className="space-x-2">
                            {listingData?.categories.map((category, idx) => {
                                return(<CategoryLabel key={idx} category={categoriesConfig.categories.find(cat => cat.name === category.categoryName)} />)
                            })}
                        </div>
                    </div>}

                    <div>
                        <h2 className="text-2xl font-bold uppercase font-mono text-neutral-400">Description</h2>
                        <p>{listingData?.description}</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold uppercase font-mono text-neutral-400 mb-2">Seller Information</h2>

                        <div className="flex gap-4 items-center">
                            <div className="size-18 rounded-full overflow-clip border-2 border-(--light-dark)">
                                <img 
                                    className="object-cover h-full aspect-square" 
                                    src={listingOwner?.profilePictureId ?
                                        endpointsConfig.BackendStaticUrl + 'uploads/profilePictures/' + listingOwner.profilePictureId + '.png' :
                                        DefProfile
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <p className="text-lg font-bold">{listingOwner?.username}</p>

                                    <div className="rounded-full bg-rose-600 px-3 py-1 ml-3 flex select-none">
                                        <p>{listingOwner?.role}</p>
                                        {listingOwner?.isVerified ? 
                                        <div className="ml-2 peer">✓</div> :
                                        <div className="ml-2 peer">X</div>
                                        }
                                    </div>

                                </div>
                                <p className="h-8 text-sm">Member since: {listingOwner ? formatDateString(listingOwner.createdAt, 'year-month-day') : ''}</p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function ImageRoulette({ images }: { images: ListingImage[] }) {

    const [index, setIndex] = useState<number>(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToIndex = (idx: number) => {

        setIndex(idx);
        
        if (!scrollRef.current) return;

        const child = scrollRef.current.children[idx] as HTMLElement;
        if (!child) return;

        child.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
    }

    return(
        <div className="w-full relative">

            <div className="lg:aspect-video aspect-square overflow-x-scroll flex flex-nowrap flex-row snap-x snap-mandatory hide-scrollbar" ref={scrollRef}>
                {images.map((image, idx) => {
                        return <DynamicImage 
                            key={idx} 
                            relativePath={image.relativePath} 
                            imageIndex={idx} 
                            currentIndex={index}
                        />
                    })
                }
            </div>

            <div 
                className="absolute h-full left-0 top-0 flex items-center justify-center text-4xl font-bold text-white select-none cursor-pointer bg-neutral-800 opacity-20 hover:opacity-80 transition-opacity duration-500 px-4"
                onClick={() => scrollToIndex((index - 1  + images.length) % images.length)}
            >
                {"<"}
            </div>

            <div 
                className="absolute h-full right-0 top-0 flex items-center justify-center text-4xl font-bold text-white select-none cursor-pointer bg-neutral-800 opacity-20 hover:opacity-80 transition-opacity duration-500 px-4"
                onClick={() => scrollToIndex((index + 1) % images.length)}
            >
                {">"}
            </div>

        </div>
    )
}

function DynamicImage({ imageIndex, currentIndex, relativePath }: { imageIndex: number, currentIndex: number, relativePath: string }) {

    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (isLoaded || imageIndex !== currentIndex)
            return;

        setIsLoaded(true);
    }, [currentIndex])

    return(
        <img className="object-contain min-w-full h-full snap-center" src={isLoaded ? endpointsConfig.BackendStaticUrl + relativePath : undefined}/>
    )
}