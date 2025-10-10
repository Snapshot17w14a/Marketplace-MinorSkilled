import Button from '../Components/Button'
import TopNavigation from '../Components/TopNavigation'
import { IsLoggedIn } from '../Auth'
import { useNavigate } from 'react-router-dom'
import { useCallback, useState, useRef, type FormEvent } from 'react';
import ListingCard, { type ListingDescriptor } from '../Components/ListingCard';
import ProductAnimator from '../Components/ProductAnimator';

export default function Home() {

    const [searchDisabled, setSearchDisabled] = useState<boolean>(false);

    const searchRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const handleCreateListing = useCallback(() => {
        navigate(IsLoggedIn() ? 'listingCreator' : 'account/register');
    }, [IsLoggedIn]);

    const testDescriptor: ListingDescriptor = {
        imageSource: 'BlackIce.png',
        title: 'Vite site',
        price: 2000,
        description: 'A site using vite as the development server and tool',
        url: '/'
    };

    const testListings = [
        <ListingCard descriptor={testDescriptor} />,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>,
        <ListingCard/>
    ]

    const onSearchSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (searchRef.current === null) return;

        console.log("fetch from backend, query: " + searchRef.current.value);
    };

    return(
        <div className='flex justify-center'>
            <TopNavigation/>
            <div className='w-2/3 pt-16 text-center'>
                <h1 className='font-bold text-6xl mt-24'>Modern marketplace for modern people</h1>
                <h2 className='text-2xl mt-12'>Create beautiful listings and find the right audience for your products</h2>
                <Button variant='filled' className='text-2xl px-8 py-4 mt-12' onClick={handleCreateListing}>Create a listing</Button>
                <div className='mt-12 w-full flex justify-center items-center flex-wrap'>
                    <h2 className='text-2xl inline-block'>Search for </h2>
                    <ProductAnimator interval={2000} className='text-2xl from-rose-950 to-rose-50 bg-linear-to-r bg-clip-text text-transparent animate-progtext inline-block' />
                    <h2 className='text-2xl inline-block'>and see what others are selling</h2>
                </div>
                <form className='mt-12 w-2/3 mx-auto' onSubmit={onSearchSubmit}>
                    <input className={`textinput-standard w-full ${searchDisabled ? 'disabled' : ''}`} placeholder='Search for anything...' ref={searchRef}></input>
                </form>
                <h2 className='text-2xl mt-12'>Or check out our latest listings below</h2>
                <div className='w-full h-96 rounded-lg bg-[#262626] border-2 border-[#484747] my-12 p-2 overflow-x-auto overflow-y-clip grid grid-rows-1 grid-flow-col'>
                    {testListings}
                </div>
            </div>
        </div>
    )
}