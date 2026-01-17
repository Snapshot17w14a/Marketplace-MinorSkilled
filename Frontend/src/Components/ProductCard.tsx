import { Heart } from 'lucide-react';
import type { ListingDescriptor } from '../types/listingDescriptor';
import backendConfig from '../Configs/endpoints.config'
import { useNavigate } from 'react-router-dom';
import CategoryLabel from './CategoryLabel';
import categoriesConfig from '../Configs/categories.config';
import { useState } from 'react';
import { isListingSaved, toggleSavedListing } from '../SavedListings';

export default function ProductCard({ descriptor }: { descriptor: ListingDescriptor}) {

  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(isListingSaved(descriptor.listingId))

  const handleSaveClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();

    setIsSaved(toggleSavedListing(descriptor.listingId));
  }

  return (
    <div 
      className="group relative w-72 overflow-hidden rounded-xl bg-(--mid-dark) shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer inline-block" 
      onClick={() => navigate(`/listing/${descriptor.listingId}`)}
    >
      
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img 
          src={backendConfig.BackendStaticUrl + descriptor.images[0]?.relativePath}
          alt="Product" 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Price Badge: Floating on image */}
        <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-sm font-bold text-white backdrop-blur-sm border border-white/10">
          {descriptor.currency}{descriptor.price}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 relative h-48 flex flex-col justify-between">

        <div className='max-h-24'>
          <div className="flex items-start justify-between">
            <div className='text-start'>
              <h3 className="text-lg font-semibold text-white group-hover:text-rose-500 transition-colors line-clamp-1">
                {descriptor.title}
              </h3>
              <p className="mt-1 text-xs text-neutral-400">Listed by {descriptor.userId}</p>
            </div>
          </div>

          {/* Description Snippet */}
          <p className="mt-3 min-h-10 text-sm text-start text-neutral-300 line-clamp-2">
            {descriptor.description}
          </p>

        </div>
        
        {/* Footer: Categories or Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 min-h-10 gap-2">

            <div className='space-x-2 max-w-64 overflow-x-scroll hide-scrollbar'>
              {descriptor.categories.map((catDTO) => {
                return <CategoryLabel category={categoriesConfig.categories.find(cat => cat.name === catDTO.categoryName)} key={catDTO.categoryName} />
              })}
            </div>

            {/* Icon Button for saving */}
            <button 
              className={`hover:text-white transition-colors ${isSaved ? "text-rose-400" : "text-neutral-400"}`}
              onClick={handleSaveClick}
            >
              <Heart className='transition-all' size={20} fill={isSaved ? "oklch(71.2% 0.194 13.428)" : "#00000000"}/>
            </button>

        </div>
      </div>
    </div>
  );
};