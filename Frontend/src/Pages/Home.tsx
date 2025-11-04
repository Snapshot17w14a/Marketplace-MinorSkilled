import Button from '../Components/Button'
import TopNavigation from '../Components/TopNavigation'
import { isLoggedIn } from '../Auth'
import { useNavigate } from 'react-router-dom'
import { useCallback, useState, useRef, type FormEvent, useEffect } from 'react';
import ListingCard from '../Components/ListingCard';
import ProductAnimator from '../Components/ProductAnimator';
import { getAnonymous } from '../BackendClient';
import type { ListingDescriptor } from '../types/listingDescriptor';

export default function Home() {

    const [searchDisabled, setSearchDisabled] = useState<boolean>(false);
    const [latestListings, setLatestListings] = useState<ListingDescriptor[] | null>(null);

    const searchRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const handleCreateListing = useCallback(() => {
        navigate(isLoggedIn() ? 'listingCreator' : 'account/register');
    }, [isLoggedIn]);

    useEffect(() => {
        const fetchListngs = async () => {
            const data = await getAnonymous<ListingDescriptor[]>("listings/GetPage/8");

            console.log(data);

            setLatestListings(data);
        };

        fetchListngs();
    }, []);

    const onSearchSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (searchRef.current === null) return;

        navigate(`/search/${searchRef.current.value}`);
    };

    return(
        <div className='flex justify-center'>
            <TopNavigation/>
            <div className='max-w-full p-8 pt-16 text-center'>
                <h1 className='font-bold text-6xl mt-24'>Modern marketplace for modern people</h1>
                <h2 className='text-2xl mt-12'>Create beautiful listings and find the right audience for your products</h2>
                <Button variant='filled' className='text-2xl px-8 py-4 mt-12' onClick={handleCreateListing}>Create a listing</Button>
                <div className='mt-12 w-full flex justify-center items-center flex-wrap'>
                    <h2 className='text-2xl inline-block'>Search for </h2>
                    <ProductAnimator interval={2000} className='text-2xl from-rose-950 to-rose-50 bg-linear-to-r bg-clip-text text-transparent animate-progtext inline-block' />
                    <h2 className='text-2xl inline-block'>and see what others are selling</h2>
                </div>
                <form className='mt-12 w-full sm:w-2/3 mx-auto' onSubmit={onSearchSubmit}>
                    <input className={`textinput-standard w-full ${searchDisabled ? 'disabled' : ''}`} placeholder='Search for anything...' ref={searchRef}></input>
                </form>
                <h2 className='text-2xl mt-12'>Or check out our latest listings below</h2>
                <div className='w-full h-96 rounded-lg bg-[#262626] border-2 border-[#484747] my-12 p-2 overflow-x-auto overflow-y-clip grid grid-rows-1 grid-flow-col gap-2'>
                    {latestListings && latestListings.map((listing, index) => {
                        return(<ListingCard className='h-full' key={index} descriptor={listing}></ListingCard>)
                    })}
                </div>
            </div>
        </div>
    )
}