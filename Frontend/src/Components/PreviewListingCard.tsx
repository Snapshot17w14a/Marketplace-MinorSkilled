export default function PreviewListingCard() {
    return(
        <div className="bg-(--dark) border-2 border-(--light-dark) rounded-lg h-full relative aspect-square">
            <div className="h-3/5 object-fill overflow-clip flex justify-center rounded-lg m-2 bg-(--mid-dark) border-2 border-(--light-dark) animate-pulse">
                <div className="h-full"></div>
            </div>
            <div className="font-bold text-2xl flex justify-between h-4 overflow-clip truncate">
                <div className="mx-4 w-1/2 bg-(--mid-dark) animate-pulse rounded-lg"></div>
                <div className="w-1/4 mx-4 rounded-lg text-nowrap bg-(--mid-dark) animate-pulse">
                    <div className="inline-block"></div>
                    <div className="inline-block mr-4 ml-2"></div>
                </div>
            </div>
            <div className="text-start mx-4 my-2 h-16">
                <div className="bg-(--mid-dark) animate-pulse h-4 rounded-lg inline-block mx-0.5 w-12"></div>
                <div className="bg-(--mid-dark) animate-pulse h-4 rounded-lg inline-block mx-0.5 w-36"></div>
                <div className="bg-(--mid-dark) animate-pulse h-4 rounded-lg inline-block mx-0.5 w-16"></div>
                <div className="bg-(--mid-dark) animate-pulse h-4 rounded-lg inline-block mx-0.5 w-64"></div>
                <div className="bg-(--mid-dark) animate-pulse h-4 rounded-lg inline-block mx-0.5 w-32"></div>
            </div>
            <div className="flex ml-36 mr-12 justify-between">
                <div className="px-2 py-1"></div>
                <div className="aspect-square w-8"></div>
            </div>
        </div>
    )
}