import { Heart } from 'lucide-react'; // Assuming you use lucide-react or similar icons
import type { ListingDescriptor } from '../types/listingDescriptor';
import backendConfig from '../Configs/endpoints.config'
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ descriptor }: { descriptor: ListingDescriptor}) {

  const navigate = useNavigate();

  return (
    // Card Container: No border, lighter background than page, subtle shadow
    <div className="group relative w-72 overflow-hidden rounded-xl bg-(--mid-dark) shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer inline-block" onClick={() => navigate(`/listing/${descriptor.guid}`)}>
      
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img 
          src={backendConfig.BackendStaticUrl + descriptor.images[0].relativePath}
          alt="Product" 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Price Badge: Floating on image */}
        <div className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-sm font-bold text-white backdrop-blur-sm border border-white/10">
          {descriptor.currency}{descriptor.price}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className='text-start'>
            <h3 className="text-lg font-semibold text-white group-hover:text-rose-500 transition-colors">
              {descriptor.title}
            </h3>
            <p className="mt-1 text-xs text-neutral-400">Listed by {descriptor.userId}</p>
          </div>
        </div>

        {/* Description Snippet */}
        <p className="mt-3 min-h-10 text-sm text-start text-neutral-300 line-clamp-2">
          {descriptor.description}
        </p>
        
        {/* Footer: Categories or Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
            Gaming
          </span>
          
          {/* Icon Button instead of text button */}
          <button className="text-neutral-400 hover:text-white transition-colors">
            <Heart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};