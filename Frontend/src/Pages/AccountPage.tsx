import { Outlet } from "react-router-dom";
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const FadeContext = createContext<() => void>(() => {});

export function AccountPage() {

    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [visible, setVisible] = useState(true);

    const outletDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setContainerHeight(outletDiv.current?.clientHeight ?? 0);
    }, [outletDiv])

    const fadeDiv = () => {
        setVisible(false);
        setTimeout(() => {
            setVisible(true);
            setTimeout(() => {
                setContainerHeight(outletDiv.current?.clientHeight ?? 0);
            }, 10);
        }, 500);
    };

    return(
        <FadeContext.Provider value={fadeDiv}>
            <div className="flex justify-center content-start h-screen">
                <div className={`flex flex-wrap shrink-1 bg-neutral-300 dark:bg-neutral-800 rounded-lg self-center max-w-[480px] text-center drop-shadow-2xl drop-shadow-rose-500/50 transition-all mx-8`}
                    style={{height: containerHeight}}
                >
                    <div className={`w-full h-min transition-all duration-500`} style={{opacity: visible ? 100 : 0}} ref={outletDiv}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </FadeContext.Provider>
    )
}

export function useFade() {
    return useContext(FadeContext);
}