import { Outlet, useLocation } from "react-router-dom";
import { createContext, useContext, useState } from 'react';

const FadeContext = createContext<() => void>(() => {});

export function AccountPage() {

    const [visible, setVisible] = useState(true);
    const location = useLocation();

    const fadeDiv = () => {
        setVisible(false);
        setTimeout(() => {
            setVisible(true);
        }, 500);
    };

    return(
        <FadeContext.Provider value={fadeDiv}>
            <div className="flex justify-center content-start h-screen">
                <div className={`flex flex-wrap shrink-1 bg-neutral-300 dark:bg-neutral-800 rounded-lg self-center max-w-[480px] text-center drop-shadow-2xl drop-shadow-rose-500/50 transition-all mx-8    
                        ${location.pathname === "/account/register" ? "h-[30rem]" : location.pathname === "/account/login" ? "h-96" : ""}
                `}>
                    <div className={`w-full h-full transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </FadeContext.Provider>
    )
}

export function useFadeContext() {
    return useContext(FadeContext);
}