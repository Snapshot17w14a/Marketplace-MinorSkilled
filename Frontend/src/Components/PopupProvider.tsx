import { createContext, type JSX, useContext, useState } from "react"
import Popup from "./Popup";

const PopupContext = createContext<(content: PopupContent) => void>(() => {});

export default function PopupProvider({ children } : { children: React.ReactNode}) {

    const [popup, setPopup] = useState<JSX.Element | undefined>(undefined);
    const [opacity, setOpacity] = useState<number>(0);

    const showPopup = (content: PopupContent) => {
        setPopup(<Popup content={content} remove={removePopup}/>);
        setOpacity(1);
    }

    const removePopup = () => {
        setOpacity(0);
        setTimeout(() => {
            setPopup(undefined);    
        }, 500);
    }

    return(
        <PopupContext.Provider value={showPopup}>
            {children}
            <div className="absolute top-0 left-0 w-full h-full bg-neutral-700/50 flex justify-center items-center transition-opacity duration-500 p-4" style={{opacity: opacity, zIndex: popup ? 100 : -100}}>
                {popup}
            </div> 
        </PopupContext.Provider>
    )
}

export function usePopup() {
    return useContext(PopupContext);
}

export interface PopupContent {
    title: string,
    message: string
    onAccept: () => void
}