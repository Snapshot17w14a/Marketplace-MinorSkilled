import { useNavigate, useParams } from "react-router-dom"
import TopNavigation from "../Components/TopNavigation";
import { createContext, useContext, useEffect, useRef, useState, type FormEvent } from "react";
import Button from "../Components/Button";
import Separator from "../Components/Separator";
import { getAnonymous } from "../BackendClient";
import type { ListingDescriptor } from "../types/listingDescriptor";
import ListingCard from "../Components/ListingCard";
import type { QueryResult } from "../types/queryResult";
import { useNotification } from "../Components/NotificationProvider";

const ResultUpdaterContext = createContext<(count: number) => void>(() => {});

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

    return(
        <div className="overflow-hidden relative min-h-screen">
            <TopNavigation className=" z-10"/>
            <div className="p-4 pt-24">
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
                <ResultUpdaterContext.Provider value={setResultCount}>
                    {searchPhrase && <Results parameters={queryFilters}></Results>}
                </ResultUpdaterContext.Provider>
            </div>
            <FilterPanel enabled={filterVisible} setVisible={setFilterVisible} setFilters={setQueryFilters}></FilterPanel>
        </div>
    )
}

function useResultUpdater() {
    return useContext(ResultUpdaterContext);
}

function Results({ parameters } : { parameters: SearchQueryParameters }) {

    const setResultCount = useResultUpdater();
    const notify = useNotification();

    const [listingPage, setListingPage] = useState<ListingDescriptor[] | null>(null);

    const fetchListings = async () => {
        const queryString = buildQueryString(parameters);

        try {
            const data = await getAnonymous<QueryResult>(`listings/QueryPage?${queryString}`);

            setListingPage(data.listings);
            setResultCount(data.listingCount);
        }
        catch (error) {
            notify({
                type: "error",
                header: `An error occured while trying to search for the term "${parameters.phrase}"`,
                message: `${error}`
            });
        }
    };
    
    useEffect(() => {
        fetchListings();
    }, [parameters]);

    return(
        <div className="mt-2">
            {listingPage !== null && <PageResults listings={listingPage} page={1}/>}
        </div>
    )
}

function PageResults({ listings, page } : { listings: ListingDescriptor[], page: number }){
    return(
        <>
            <div className="flex flex-wrap w-full px-2 justify-around">
                {listings !== undefined && listings.map((listingData, index) => {return(<div className="p-1 h-96 min-w-full sm:min-w-1/6 max-w-full shrink-0 flex justify-center" key={index}><ListingCard className="h-full" descriptor={listingData}/></div>)})}
            </div>
            <Separator text={`Page ${page}`} />
        </>
    )
}

function FilterPanel({ enabled, setVisible, setFilters } : { enabled: boolean, setVisible: React.Dispatch<React.SetStateAction<boolean>>, setFilters: React.Dispatch<React.SetStateAction<SearchQueryParameters>> }) {

    const selectRef = useRef<HTMLSelectElement | null>(null);
    const descendingRef = useRef<HTMLInputElement | null>(null);

    const applyFilters = (e: FormEvent) => {
        e.preventDefault();

        setFilters(prev => {

            if (!selectRef.current) return prev;

            const expr = selectRef.current.value;
            switch (expr) {
                case "Latest":
                    prev.sortBy = "CreatedAt"
                    break;
                case "Price ascending":
                    prev.sortBy = "price"
                    break;
                case "Price descending":
                    if (!descendingRef.current) break;
                    prev.sortBy = "price";
                    prev.descending = descendingRef.current.checked;
                    break;
            }
            
            console.log(prev);

            return prev;
        })
    }

    return(
        <div className="w-1/3 pt-15.5 h-screen absolute top-0 right-0 z-20 transition-transform duration-500" style={{transform: `translateX(${enabled ? 0 : 100}%)`}}>
            <div className="bg-(--dark) border-2 border-(--light-dark) rounded-lg h-full p-4">
                <div className="flex items-center mb-4">
                    <Button className="px-2 py-0.5" onClick={() => setVisible(prev => !prev)}>X</Button>
                    <h1 className="w-full font-bold text-2xl text-center">Filters</h1>
                </div>
                <form onSubmit={applyFilters}>
                    <h2 className="font-semibold">Sort by</h2>
                    <select ref={selectRef} className="textinput-standard">
                        <option>Latest</option>
                        <option>Price ascending</option>
                        <option>Price descending</option>
                    </select>
                    <label htmlFor="descending">Descending</label>
                    <input ref={descendingRef} type="checkbox" name="descending"></input>
                    <Button className="px-2 py-1" type="submit">Apply filters</Button>
                </form>
            </div>
        </div>
    )
}

function buildQueryString(queryParams: SearchQueryParameters): string {
    let builder = new URLSearchParams;

    console.log(queryParams);

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