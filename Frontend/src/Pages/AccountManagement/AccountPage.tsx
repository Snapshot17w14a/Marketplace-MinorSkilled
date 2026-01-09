import { Outlet, useNavigate } from "react-router-dom";
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const FadeContext = createContext<(destination?: string) => void>(() => {});

export function AccountPage() {

    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [visible, setVisible] = useState(true);

    const outletDiv = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        setContainerHeight(outletDiv.current?.clientHeight ?? 0);
    }, [outletDiv])

    const fadeDiv = (destination?: string) => {
        setVisible(false);
        setTimeout(() => {
            if (destination)
                navigate(destination);
            setVisible(true);
            setTimeout(() => {
                setContainerHeight(outletDiv.current?.clientHeight ?? 0);
            }, 10);
        }, 500);
    };

    return(
        <FadeContext.Provider value={fadeDiv}>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative w-full max-w-md transition-height duration-1000" style={{height: containerHeight + 64}}>
                    <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 opacity-30 blur-2xl"/>
                    <div className='w-full h-full overflow-clip relative rounded-2xl bg-neutral-900/90 p-8 border border-white/10 backdrop-blur-xl shadow-2xl'>
                        <div className={`w-full h-min transition-all duration-500`} style={{opacity: visible ? 100 : 0}} ref={outletDiv}>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </FadeContext.Provider>
    )
}

export function useFade() {
    return useContext(FadeContext);
}