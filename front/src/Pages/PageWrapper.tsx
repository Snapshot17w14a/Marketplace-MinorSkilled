import { createContext, useContext, useState } from 'react';

const TransitionContext = createContext<(cb: () => void) => void>(() => {})

export default function PageWrapper({ children }: { children: React.ReactNode }) {


    const [visible, setVisible] = useState(true);

    function changePage(callback: () => void) {
        setVisible(false);
        setTimeout(() => {
            console.log("changePage callback about to run");
            callback();
            setVisible(true);
            console.log("changePage callback finished");
        }, 500);
    }

    return(
        <TransitionContext.Provider value={changePage}>
            <div className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
                {children}
            </div>
        </TransitionContext.Provider>
    )
}

export function usePageTransition() {
  return useContext(TransitionContext)
}