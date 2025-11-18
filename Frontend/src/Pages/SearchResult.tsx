import { useNavigate, useParams } from "react-router-dom"
import TopNavigation from "../Components/TopNavigation";
import { useEffect, useRef, useState, type FormEvent, type JSX } from "react";
import Button from "../Components/Button";
import Separator from "../Components/Separator";
import { getAnonymous } from "../BackendClient";
import type { ListingDescriptor } from "../types/listingDescriptor";
import ListingCard from "../Components/ListingCard";
import type { QueryResult } from "../types/queryResult";
import { useNotify } from "../Components/NotificationProvider";
import filterParameters from "../Configs/filters.confg";
import SidePanel from "../Components/SidePanel";

export default function SearchResult() {

    const navigate = useNavigate();

    const {searchPhrase} = useParams();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [resultCount, setResultCount] = useState<number>(0);
    const [filterVisible, setFilterVisible] = useState<boolean>(false);
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
        <div className="overflow-hidden flex relative min-h-screen">
            <TopNavigation className="z-10"/>
            <div className="w-full p-4 pt-8 mt-16 relative">
                <h1 className="text-2xl">Showing {resultCount} results for "{searchPhrase}"</h1>
                <div className="flex">
                    <form className="my-4 basis-1/2" onSubmit={onSearchSubmit}>
                        <input className="textinput-standard w-full" placeholder={searchPhrase} ref={searchInputRef}/>
                    </form>
                    <div className="basis-1/2 flex items-center justify-end">
                        <Button className="px-4 py-2" onClick={() => setFilterVisible(prev => !prev)}>
                            Filters
                        </Button>
                    </div>
                </div>
                <Separator/>
                <Results parameters={queryFilters} setResultCount={setResultCount}></Results>
                <SidePanel topPadding={15.5} innerContainerClass="p-4" enabled={filterVisible}>
                    <FilterPanel setVisible={setFilterVisible} setFilters={setQueryFilters}></FilterPanel>
                </SidePanel>
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
                    { listings: <PageResults listings={data.listings} page={data.page} key={data.page}/> }
                ])
            })
            setResultCount(data.listingCount);
            setPageCount(data.pageCount);
        }
        catch (error) {
            notify({
                type: "error",
                header: `An error occured while trying gathering data!`,
                message: `${error}`
            });
        }
    };
    
    useEffect(() => {
        setListingPage([]);
        fetchListings(0);
    }, [parameters]);

    return(
        <div className="mt-2 text-center">
            {listingPages && listingPages.map(e => e.listings)}
            {listingPages.length < pageCount && <Button className="px-2 py-1 my-1" onClick={() => fetchListings(listingPages.length)}>Load more</Button>}
        </div>
    )
}

function PageResults({ listings, page } : { listings: ListingDescriptor[], page: number }){
    return(
        <>
            <div className="flex flex-wrap w-full px-2 justify-around">
                {listings !== undefined && listings.map((listingData, index) => {return(<div className="p-1 h-96 min-w-full sm:min-w-1/6 max-w-full shrink-0 flex justify-center mb-2" key={index}><ListingCard className="h-full" descriptor={listingData}/></div>)})}
            </div>
            <Separator text={`Page ${page + 1}`} />
        </>
    )
}

function FilterPanel({ setVisible, setFilters } : { setVisible: React.Dispatch<React.SetStateAction<boolean>>, setFilters: React.Dispatch<React.SetStateAction<SearchQueryParameters>> }) {

    const selectRef = useRef<HTMLSelectElement>(null);
    const minRef = useRef<HTMLInputElement>(null);
    const maxRef = useRef<HTMLInputElement>(null);

    const [priceMinMax, setPriceMinMax] = useState<{ minValue: number, maxValue: number }>({ minValue: filterParameters.minPrice, maxValue: filterParameters.maxPrice });

    const applyFilters = (e: FormEvent) => {
        e.preventDefault();

        setFilters(prev => {

            const obj: SearchQueryParameters = {
                ...prev
            }

            if (!selectRef.current) return obj;

            const expr = selectRef.current.value;
            switch (expr) {
                case "Latest":
                    obj.sortBy = "CreatedAt"
                    obj.descending = true;
                    break;
                case "Oldest":
                    obj.sortBy = "CreatedAt"
                    obj.descending = false
                    break;
                case "Price Ascending":
                    obj.sortBy = "price"
                    obj.descending = false;
                    break;
                case "Price Descending":
                    obj.sortBy = "price";
                    obj.descending = true;
                    break;
            }

            if (!minRef.current || !maxRef.current) return obj;

            obj.minPrice = Number.parseInt(minRef.current.value);
            obj.maxPrice = Number.parseInt(maxRef.current.value);

            return obj;
        })

        setVisible(prev => !prev);
    }

    useEffect(() => {
        if (!minRef.current || !maxRef.current) return;

        minRef.current.value = `${filterParameters.minPrice}`;
        maxRef.current.value = `${filterParameters.maxPrice}`;
    }, [minRef, maxRef])

    return(
        <>
            <div className="flex items-center mb-4">
                <Button className="px-2 py-0.5" onClick={() => setVisible(prev => !prev)}>X</Button>
                <h1 className="w-full font-bold text-2xl text-center">Filters</h1>
            </div>
            <form onSubmit={applyFilters}>
                <div className="flex mb-4 items-center">
                    <h2 className="font-semibold basis-1/3">Sort by</h2>
                    <select ref={selectRef} className="textinput-standard basis-2/3">
                        {filterParameters.sortingParameters.map((sortParameter, index) => {
                            return(<option key={index}>{sortParameter}</option>)
                        })}
                    </select>
                </div>
                <div className="w-full">
                    <div className="w-full flex items-center">
                        <h1 className="basis-1/3">Minimum price</h1>
                        <div className="basis-2/3 flex">
                            <p className="basis-1/6">{priceMinMax.minValue}</p>
                            <input step={10} className="basis-5/6" type="range" ref={minRef} min={filterParameters.minPrice} max={priceMinMax.maxValue} onChange={event => setPriceMinMax(prev => {return({...prev, minValue: Number.parseInt(event.target.value)})})}></input>
                        </div>
                    </div>
                    <div className="w-full flex items-center">
                        <h1 className="basis-1/3">Maximum price</h1>
                        <div className="basis-2/3 flex">
                            <p className="basis-1/6">{priceMinMax.maxValue}</p>
                            <input step={10} className="basis-5/6" type="range" ref={maxRef} min={priceMinMax.minValue} max={filterParameters.maxPrice} onChange={event => setPriceMinMax(prev => {return({...prev, maxValue: Number.parseInt(event.target.value)})})}></input>
                        </div>
                    </div>
                </div>
                <br/>
                <Button className="px-2 py-1" type="submit">Apply filters</Button>
            </form>
        </>
    )
}

function buildQueryString(queryParams: SearchQueryParameters): string {
    let builder = new URLSearchParams;

    Object.entries(queryParams).forEach(([key, value]) => {
        if (key !== null && value !== null && value !== '') {
            builder.append(key, value);
        }
    })

    return builder.toString();
}

interface SearchQueryParameters {
    phrase: string,
    sortBy?: string,
    descending?: boolean,
    
    minPrice?: number,
    maxPrice?: number,

    page?: number,
    pageCount?: number
}



// helper to let the child FilterPanel expose its internal setter to the parent
/*
export type FilterPanelSetter = React.Dispatch<React.SetStateAction<boolean>>;

export const filterPanelSetterRef: { current: FilterPanelSetter | null } = { current: null };

export function useExposeFilterPanelSetter(setter: FilterPanelSetter) {
    useEffect(() => {
        filterPanelSetterRef.current = setter;
        return () => {
            if (filterPanelSetterRef.current === setter) filterPanelSetterRef.current = null;
        };
    }, [setter]);
}
*/