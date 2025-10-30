export default function Separator({ text }: { text?: string }) {



    return(
        <div className="w-full items-center text-nowrap flex">
            {text && 
                <p className="inline-block mr-2 text-(--light-dark) font-semibold">{text}</p>
            }
            <div className="h-0 border-1 border-(--light-dark) inline-block w-full rounded-2xl"></div>
        </div>
    )
}