import { createContext, useContext, useEffect, useState, type JSX } from "react"

const DragContext = createContext<(element: JSX.Element) => void>(() => {});

export default function DragElement({ children } : { children: JSX.Element[] }){

    const [element, setElement] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (!element)
            return;

        var requestId = 0;

        const animDrag = (timestamp: DOMHighResTimeStamp) => {
            console.log(timestamp);
            requestId = requestAnimationFrame(animDrag);
        }

        requestId = requestAnimationFrame(animDrag);

        return(() => {
            cancelAnimationFrame(requestId);
        })
    }, [element])

    return(
        <DragContext.Provider value={setElement}>
            <div className="top-0 left-0 w-screen h-screen z-[100]" style={{display: `${element ? "fixed" : "none"}`}}>
                {element}
            </div>
            {children}
        </DragContext.Provider>
    )
}

export function useDrag(){
    return useContext(DragContext);
}