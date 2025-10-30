import { useNavigate, useParams } from "react-router-dom"
import TopNavigation from "../Components/TopNavigation";
import { createContext, useContext, useEffect, useRef, useState, type FormEvent } from "react";
import Button from "../Components/Button";
import Separator from "../Components/Separator";
import { getAnonymous } from "../BackendClient";
import type { ListingDescriptor } from "../types/listingDescriptor";
import ListingCard from "../Components/ListingCard";
import type { QueryResult } from "../types/queryResult";

const ResultUpdaterContext = createContext<(count: number) => void>(() => {});

export default function SearchResult() {

    const navigate = useNavigate();

    const {searchPhrase} = useParams();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [resultCount, setResultCount] = useState<number>(0);

    const onSearchSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (searchInputRef.current === null) {
            return;
        }

        navigate(`/search/${searchInputRef.current.value}`);
        searchInputRef.current.value = '';
    }

    return(
        <>
            <TopNavigation className=" z-10"/>
            <div className="p-4 pt-24">
                <h1 className="text-2xl">Showing {resultCount} results for "{searchPhrase}"</h1>
                <div className="flex">
                    <form className="my-4 basis-1/2" onSubmit={onSearchSubmit}>
                        <input className="textinput-standard w-full" placeholder={searchPhrase} ref={searchInputRef}/>
                    </form>
                    <div className="basis-1/2 flex items-center justify-end">
                        <Button className="px-4 py-2">
                            Filters
                        </Button>
                    </div>
                </div>
                {/* <div className="w-full border-1 border-(--light-dark) rounded-2xl"></div> */}
                <Separator/>
                <ResultUpdaterContext.Provider value={setResultCount}>
                    {searchPhrase && <Results phrase={searchPhrase}></Results>}
                </ResultUpdaterContext.Provider>
            </div>
        </>
    )
}

function useResultUpdater() {
    return useContext(ResultUpdaterContext);
}

function Results({ phrase } : { phrase: string }){

    const setResultCount = useResultUpdater();

    const [listingPage, setListingPage] = useState<ListingDescriptor[] | null>(null);

    const fetchListings = async () => {
        const queryString = buildQueryString({phrase: phrase});

        const data = await getAnonymous<QueryResult>(`listings/QueryPage?${queryString}`);

        setListingPage(data.listings);
        setResultCount(data.listingCount);
    };
    
    useEffect(() => {
        fetchListings();
    }, [phrase]);

    return(
        <div className="mt-2">
            {listingPage !== null && <PageResults listings={listingPage} page={1}/>}
        </div>
    )
}

function PageResults({ listings, page } : { listings: ListingDescriptor[], page: number }){
    return(
        <>
            <div className="flex flex-wrap w-full px-2">
                {listings !== undefined && listings.map((listingData, index) => {return(<div className="p-1 h-96 min-w-1/4 shrink-0 flex justify-center" key={index}><ListingCard className="h-full" descriptor={listingData}/></div>)})}
            </div>
            <Separator text={`Page ${page}`} />
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

    page?: number,
    pageCount?: number
}