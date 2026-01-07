import { useEffect, useState, type JSX } from 'react';
import ProductCard from './ProductCard'; // Assuming the component above
import { getAnonymous } from '../BackendClient';
import type { ListingDescriptor } from '../types/listingDescriptor';
import PreviewListingCard from './PreviewListingCard';

export default function MarketplaceLayout() {

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

    useEffect(() => {
            const fetchListngs = async () => {
                const data = await getAnonymous<ListingDescriptor[]>("listings/GetLatest/8");
    
                const ListingCards: JSX.Element[] = data.map((listing, index) => {
                    //return(<ListingCard className='h-full' key={index} descriptor={listing} />)
                    return(<ProductCard key={index} descriptor={listing}/>)
                });
    
                setLatestListings(ListingCards);
            };
    
            fetchListngs();
        }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      
      {/* Navbar Placeholder */}
      <nav className="border-b border-white/10 bg-neutral-900 px-6 py-4">
        <div className="text-xl font-bold text-rose-500">Kev's Marketplace</div>
      </nav>

      <div className="mx-auto max-w-[1920px] px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters - MOVED TO LEFT */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            
            {/* Search Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Search</label>
              <input 
                type="text" 
                placeholder="Search items..." 
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            {/* Filter Group */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">Price Range</h3>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" className="w-full rounded bg-neutral-800 p-2 text-sm outline-none focus:ring-1 focus:ring-rose-500" />
                <span className="text-neutral-500">-</span>
                <input type="number" placeholder="Max" className="w-full rounded bg-neutral-800 p-2 text-sm outline-none focus:ring-1 focus:ring-rose-500" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">Categories</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                {['Gaming', 'Software', 'Accounts', 'Items'].map((cat) => (
                  <li key={cat} className="flex items-center gap-2 cursor-pointer hover:text-rose-400 transition-colors">
                    <input type="checkbox" className="rounded border-neutral-700 bg-neutral-800 text-rose-500 focus:ring-0" />
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content Grid */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Showing results for "C"</h1>
              <select className="rounded-lg bg-neutral-800 border-none px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-rose-500">
                <option>Sort by: Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Render your ProductCards here */}
              {latestListings}
            </div>
            
            {/* Load More */}
            <div className="mt-12 flex justify-center">
              <button className="rounded-full border border-neutral-700 bg-transparent px-8 py-2 text-sm font-medium hover:border-rose-500 hover:text-rose-500 transition-colors">
                Load More
              </button>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};