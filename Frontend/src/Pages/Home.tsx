import Button from '../Components/Button'
import { isLoggedIn } from '../Auth'
import { useNavigate } from 'react-router-dom'
import { useCallback, useState, useRef, type FormEvent, useEffect, type JSX } from 'react';
import ProductAnimator from '../Components/ProductAnimator';
import { getAnonymous } from '../BackendClient';
import type { ListingDescriptor } from '../types/listingDescriptor';
import PreviewListingCard from '../Components/PreviewListingCard';
import ProductCard from '../Components/ProductCard';
import PillButton from '../Components/PillButton';
import { Search } from 'lucide-react';

export default function Home() {

    const [latestListings, setLatestListings] = useState<JSX.Element[]>([
        <PreviewListingCard key={0} />,
        <PreviewListingCard key={1} />,
        <PreviewListingCard key={2} />,
        <PreviewListingCard key={3} />,
        <PreviewListingCard key={4} />,
        <PreviewListingCard key={5} />,
        <PreviewListingCard key={6} />,
        <PreviewListingCard key={7} />,
        <PreviewListingCard key={8} />,
    ]);

    const searchRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const handleCreateListing = useCallback(() => {
        navigate(isLoggedIn() ? 'listing/creator' : 'account/register');
    }, [isLoggedIn]);

    useEffect(() => {
        const fetchListngs = async () => {
            const data = await getAnonymous<ListingDescriptor[]>("listings/GetLatest/8");

            const ListingCards: JSX.Element[] = data.map((listing, index) => {
                return(<ProductCard key={index} descriptor={listing}/>)
            });

            setLatestListings(ListingCards);
        };

        fetchListngs();
    }, []);

    const onSearchSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (searchRef.current === null || searchRef.current.value === '') return;

        navigate(`/search/${searchRef.current.value}`);
    };

    return(
        <div className='w-full p-2 sm:p-8 text-center mt-24 space-y-12 hide-scrollbar'>

            <div className='space-y-4'>
                <h1 className='font-bold text-6xl'>Modern marketplace for modern people</h1>
                <h2 className='font-medium text-2xl'>Create beautiful listings and find the right audience for your products</h2>
            </div>

            <Button variant='filled' className='text-2xl px-8 py-4' onClick={handleCreateListing}>Create a listing</Button>

            <div className='w-full flex justify-center items-center flex-wrap'>
                <h2 className='text-2xl inline-block'>Search for </h2>
                <ProductAnimator interval={2000} className='text-2xl from-rose-950 to-rose-50 bg-linear-to-r bg-clip-text text-transparent animate-progtext inline-block' />
                <h2 className='text-2xl inline-block'>and see what others are selling</h2>
            </div>

            <form className='w-full sm:w-2/3 mx-auto relative flex z-0' onSubmit={onSearchSubmit}>
                <input className='textinput-standard' placeholder='Search for anything...' ref={searchRef} required/>
                {/* <Button className='px-2 absolute right-1.5 top-1' variant='filled'>Search</Button> */}
                {/* <div className='absolute right-1.5 px-2 py-1 my-2 border border-(--light-dark) rounded-full cursor-pointer'>Search</div> */}
                <PillButton className='absolute right-1.5 px-2 py-1 my-2' text='Search' icon={<Search/>} />
            </form>

            <h2 className='text-2xl mt-12'>Or check out our latest listings below</h2>

            <div className='w-full rounded-lg my-12 p-2 overflow-x-auto overflow-y-clip grid grid-rows-1 grid-flow-col gap-2'>
                {latestListings}
            </div>

        </div>
    )
}