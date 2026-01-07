import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useRef, useState, type FormEvent, type JSX } from "react";
import { getAnonymous } from "../BackendClient";
import type { ListingDescriptor } from "../types/listingDescriptor";
import type { QueryResult } from "../types/queryResult";
import { useNotify } from "../Components/NotificationProvider";
import ProductCard from "../Components/ProductCard";
import CategoryLabel from "../Components/CategoryLabel";
import categoriesConfig from "../Configs/categories.config";
import filtersConfg from "../Configs/filters.confg";
import PillButton from "../Components/PillButton";
import { ListRestart } from "lucide-react";

export default function SearchResult() {

    const navigate = useNavigate();

    const {searchPhrase} = useParams();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [resultCount, setResultCount] = useState<number>(0);
    const [queryFilters, setQueryFilters] = useState<SearchQueryParameters>({
        phrase: searchPhrase ?? ""
    });

    const onSearchSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (searchInputRef.current === null) {
            return;
        }

        navigate(`/search/${searchInputRef.current.value}`);
        searchInputRef.current.value = '';
    }

    const handleSortSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        
        setQueryFilters(prev => {
            const obj: SearchQueryParameters = {
                ...prev
            }

            const expression = e.target.value;

            console.log(expression);
            switch (expression) {
                case "Sort by: Latest":
                    obj.sortBy = "CreatedAt"
                    obj.descending = true;
                    break;
                case "Sort by: Oldest":
                    obj.sortBy = "CreatedAt"
                    obj.descending = false
                    break;
                case "Sort by: Price Ascending":
                    obj.sortBy = "price"
                    obj.descending = false;
                    break;
                case "Sort by: Price Descending":
                    obj.sortBy = "price";
                    obj.descending = true;
                    break;
            }

            return obj;
        })
    }

    const handleCategorySelection = (isSelected: boolean, categoryId?: number) => {

        if (categoryId === undefined) return

        setQueryFilters(prev => {
            const obj: SearchQueryParameters = {
                ...prev
            }

            if (!obj.categories)
                obj.categories = [];

            if (isSelected && obj.categories.find(e => e === categoryId) === undefined) {
                obj.categories.push(categoryId);
            }
            else if (!isSelected && obj.categories.find(e => e === categoryId) !== undefined) {
                obj.categories = obj.categories.filter(e => e !== categoryId);
            }

            if (obj.categories.length === 0)
                delete obj.categories;

            return obj;
        })
    };
    

    useEffect(() => {
        setQueryFilters(prev => {
            if (prev.phrase === searchPhrase) return prev;
            return({
                ...prev,
                phrase: searchPhrase ?? ''
            })
        })
    }, [searchPhrase]);

    return(
        <div className="mx-auto max-w-[1920px] mt-24 px-6">
            <div className="flex flex-col lg:flex-row gap-8">

                <aside className="w-full lg:w-64 space-y-8">

                    {/* Search bar */}
                    <div className="space-y-2">
                        <h3 className="font-semibold">Search</h3>
                        <form onSubmit={onSearchSubmit}>
                            <input 
                                type="text"
                                className="textinput-slim" 
                                placeholder="Search items..."
                                ref={searchInputRef}
                            />
                        </form>
                        
                    </div>

                    {/* Price selector */}
                    <div className="space-y-2">
                        <h3 className="uppercase text-neutral-400 font-semibold font-sm">Price range</h3>
                        <div className="flex items-center gap-2">
                            <input 
                                className="textinput-slim" 
                                type="number" 
                                placeholder="Min"
                            />
                            <span className="text-neutral-400">-</span>
                            <input 
                                className="textinput-slim" 
                                type="number" 
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Category selector */}
                    <div className="space-y-2">
                        <h3 className="uppercase text-neutral-400 font-semibold font-sm">Categories</h3>

                        <ul className="space-y-2 text-sm">
                            {categoriesConfig.categories.map((category, index) => {
                                return(
                                    <li key={index}>
                                        <label 
                                            className="flex gap-2 select-none" 
                                        >
                                            <input 
                                                className=""
                                                type="checkbox"
                                                onChange={(e) => handleCategorySelection(
                                                    e.target.checked, 
                                                    categoriesConfig.categoryIds.find(cat => cat.name === category.name)?.id
                                                )}
                                            />
                                            <CategoryLabel category={category} />
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                </aside>

                <main className="flex-1">
                    
                    {/* Results text, and sorting */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-2xl">Showing {resultCount} results for "{searchPhrase}"</h2>
                        <select className="rounded-lg bg-neutral-800 border-none px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-rose-500" onChange={handleSortSelection}>
                            {filtersConfg.sortingParameters.map((parameter, index) => {
                                return <option key={index}>Sort by: {parameter}</option>
                            })}
                        </select>
                    </div>
                    
                    {/* Listings */}
                    <Results parameters={queryFilters} setResultCount={setResultCount}></Results>

                </main>
            </div>
        </div>
    )
}

function Results({ parameters, setResultCount } : { parameters: SearchQueryParameters, setResultCount: React.Dispatch<React.SetStateAction<number>> }) {

    const notify = useNotify();

    const [listingPages, setListingPage] = useState<{ listings: JSX.Element }[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const lastQuery = useRef<string>('');

    const fetchListings = async (page: number) => {
        const queryString = buildQueryString({...parameters, page: page});

        if (queryString === lastQuery.current) return;
        lastQuery.current = queryString;

        try {
            const data = await getAnonymous<QueryResult>(`listings/QueryPage?${queryString}`);

            setListingPage(prev => {
                return([
                    ...prev,
                    { listings: <PageResults listings={data.listings} key={data.page}/> }
                ])
            })
            setResultCount(data.listingCount);
            setPageCount(data.pageCount);
        }
        catch (error) {
            notify({
                type: "error",
                header: `An error occured while trying to gather data!`,
                message: `${error}`
            });
        }
    };
    
    useEffect(() => {
        setListingPage([]);
        fetchListings(0);
    }, [parameters]);

    return(
        <>
            <div className="flex justify-around mb-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-fit">
                    {listingPages && listingPages.map(e => e.listings)}
                </div>
            </div>
            
            {pageCount != listingPages.length &&
                <div className="w-full flex justify-around mb-4">
                    <PillButton icon={<ListRestart />} text="Load more" onClick={() => fetchListings(listingPages.length)}/>
                </div>
            }
        </>
        )
}

function PageResults({ listings } : { listings: ListingDescriptor[] }){
    return(<>{listings && listings.map((data, index) => <ProductCard descriptor={data} key={index}/>)}</>)
}

function buildQueryString(queryParams: SearchQueryParameters): string {
    let builder = new URLSearchParams;

    Object.entries(queryParams).forEach(([key, value]) => {
        if (key !== null && value !== null && value !== '') {
            if(value instanceof Array) {
                value.forEach(v => {
                    builder.append(key, v.toString());
                })}
            else{
                builder.append(key, value);
            }
        }
    })

    return builder.toString();
}

interface SearchQueryParameters {
    categories?: number[]

    phrase: string,
    sortBy?: string,
    descending?: boolean,
    
    minPrice?: number,
    maxPrice?: number,

    page?: number,
    pageCount?: number
}