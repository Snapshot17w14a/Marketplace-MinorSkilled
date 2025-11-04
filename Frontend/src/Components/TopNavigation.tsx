import { useNavigate } from 'react-router-dom'
import { getActiveUser, isLoggedIn as getIsLoggedIn, logOut } from '../Auth';
import Logo from '../assets/Subtract.svg'
import Button from './Button'
import { useEffect, useState } from 'react';
import SidePanel from './SidePanel';
import { getSavedListings } from '../SavedListings';
import type { SavedListing } from '../types/savedListing';
import ListingCard from './ListingCard';
import { type ListingDescriptor } from '../types/listingDescriptor';
import { getAnonymous } from '../BackendClient';

export default function TopNavigation({ className = ''}) {

    useEffect(() => {
        setIsLoggedIn(getIsLoggedIn());
    }, []);

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [savedListingsVisible, setSavedListingsVisible] = useState<boolean>(false);

    const savedListings = <SavedListings />;

    const handleLogOut = () => {
        logOut();
        setIsLoggedIn(false);
    };

    return(
        <>
            <nav className={'w-screen h-16 bg-[#262626] border-b-2 border-[#484747] p-2 flex justify-between fixed top-0 drop-shadow-xl drop-shadow-rose-500/50 ' + className}>
                <div className='flex h-full justify-around items-center'>
                    <button type='button' className='h-full w-12 cursor-pointer' onClick={() => navigate('/')}>
                        <img src={Logo} className='h-full object-contain'></img>
                    </button>
                    <p className='mx-2 text-3xl font-bold text-rose-500 invisible w-0 sm:w-auto sm:visible'>Kev's marketplace</p>
                </div>
                {
                    isLoggedIn ? 
                    <div className='flex h-full'> 
                        <div className='flex items-center h-full'>
                            <Button variant='filled' className='px-2.5 py-1 object-contain aspect-square h-full' onClick={() => setSavedListingsVisible(prev => !prev)}>
                                <svg className='w-full h-full' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0,0,256,256">
                                    <g fill="#ffffff" fill-rule="nonzero" stroke="#ffffff" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(4,4)"><path d="M41.148,14h-18.296c-0.47,0 -0.852,0.382 -0.852,0.852v32.36c0,0.297 0.357,0.448 0.57,0.241l8.557,-8.303c0.487,-0.472 1.26,-0.472 1.747,0l8.557,8.303c0.212,0.207 0.569,0.056 0.569,-0.24v-32.36c0,-0.471 -0.382,-0.853 -0.852,-0.853zM41.148,10c2.679,0 4.852,2.173 4.852,4.852v37.46c0,1.925 -2.314,2.903 -3.695,1.563l-10.305,-9.998l-10.305,9.999c-1.381,1.34 -3.695,0.361 -3.695,-1.563v-37.46c0,-2.68 2.173,-4.853 4.852,-4.853z"></path></g></g>
                                </svg>
                            </Button>
                            <div className='mx-2 border-1 border-(--light-dark) h-full rounded-lg' />
                            
                        </div>
                        <div className='flex justify-around items-center'>
                            <p className='font-bold text-lg w-min sm:w-auto'>Logged in as {getActiveUser()?.username}</p>
                            <Button variant='filled' className='px-4 py-2.5 ml-4' onClick={handleLogOut}>Log out</Button>
                        </div>
                    </div> 
                    :
                    <div className='flex justify-around items-center'>
                        <Button className='px-4 py-2.5 mx-2' variant='filled' onClick={() => navigate('/account/register')}>Register</Button>
                        <Button className='px-4 py-2 mx-2' onClick={() => navigate('/account/login')}>Log in</Button>
                    </div>
                }
            </nav>
            <SidePanel topPadding={15.5} innerContainerClass='overflow-y-scroll' enabled={savedListingsVisible}>
                {savedListings}
            </SidePanel>
        </>
    )

    function SavedListings() {

        const savedListings: SavedListing[] = getSavedListings();
        const [listingData, setListingData] = useState<ListingDescriptor[]>([]);

        useEffect(() => {
            fetchListings();
        }, [savedListings])

        const fetchListings = async () => {
            const promises: Promise<ListingDescriptor>[] = [];

            savedListings.forEach(sl => {
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
                <div className='flex items-center gap-4 my-8 flex-col'>
                    {savedListings.map((sl, index) => {
                        const descriptor = listingData.find(ld => ld.guid === sl.listingId);
                        if (!descriptor) return <></>
                        return(
                            <ListingCard key={index} descriptor={descriptor}></ListingCard>
                        )
                    })}
                </div>
            </>
        )
    }
}