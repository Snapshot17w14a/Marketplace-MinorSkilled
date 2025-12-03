import { useNavigate } from 'react-router-dom'
import { getActiveUser, isLoggedIn as getIsLoggedIn, logOut } from '../Auth';
import { type JSX, useEffect, useState } from 'react';
import SidePanel from './SidePanel';
import { getSavedListings } from '../SavedListings';
import type { SavedListing } from '../types/savedListing';
import ListingCard from './ListingCard';
import { type ListingDescriptor } from '../types/listingDescriptor';
import { getAnonymous } from '../BackendClient';
import { usePopup, type PopupContent } from './PopupProvider';
import { Heart, User } from 'lucide-react';
import PillButton from './PillButton';

export default function TopNavigation({ className = ''}) {

    useEffect(() => {
        setIsLoggedIn(getIsLoggedIn());
    }, []);

    const navigate = useNavigate();
    const popup = usePopup();

    const user = getActiveUser();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [savedListings] = useState<JSX.Element>(<SavedListings />);

    const handleLogOut = () => {
        logOut();
        setIsLoggedIn(false);
    };

    const logoutPopupContent: PopupContent = {
        title: "Are you sure",
        message: "You are about to log out. If you do this, you must enter your credentials next time to access content on the website.",
        onAccept: handleLogOut
    };

    return(
        <>
            <nav className={'w-screen bg-(--dark) border-b border-(--light-dark) px-3 py-3 flex justify-between fixed top-0 z-10 ' + className}>

                <p className='text-xl font-bold text-rose-500 my-auto cursor-pointer' onClick={() => navigate('/')}>Kev's marketplace</p>
                    
                <div className='flex gap-2 select-none'>

                    <PillButton icon={<Heart/>} text='Saves' className='h-8' onClick={() => popup(logoutPopupContent)}/>

                    <PillButton icon={<User/>} text={(isLoggedIn ? user?.username : "Log In") ?? ''} className='h-8' onClick={() => {isLoggedIn ? popup(logoutPopupContent) : navigate('/account/login')}}/>

                </div>

            </nav>
        </>
    )

    function SavedListings() {

        const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
        const [listingData, setListingData] = useState<ListingDescriptor[]>([]);

        useEffect(() => {
            const saves = getSavedListings();
            setSavedListings(saves);
            fetchListings(saves);
        }, [savedListings])

        const fetchListings = async (saves: SavedListing[]) => {
            const promises: Promise<ListingDescriptor>[] = [];

            saves.forEach(sl => {
                promises.push(getAnonymous<ListingDescriptor>(`Listings/Get/${sl.listingId}`));
            })

            const result = await Promise.allSettled(promises);
            const descriptors: ListingDescriptor[] = [];
            
            result.forEach(res => {
                if (res.status === "fulfilled") {
                    descriptors.push(res.value);
                }
            })

            setListingData(descriptors);
        }

        return(
            <>
                <div className='text-center mt-8'>
                    <h1 className='font-bold text-4xl'>Saved listings</h1>
                </div>
                <div className='flex items-center gap-4 my-8 px-4 flex-col'>
                    {listingData.length !== 0 && savedListings.map((sl, index) => {
                        const descriptor = listingData.find(ld => ld.listingId === sl.listingId);
                        if (!descriptor) return <div key={index}></div>
                        return(
                            <ListingCard key={index} descriptor={descriptor} className='min-h-96 sm:w-96 w-full'></ListingCard>
                        )
                    })}
                </div>
            </>
        )
    }
}