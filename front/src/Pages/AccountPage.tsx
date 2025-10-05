import { Outlet, useLocation } from "react-router-dom";
//import Notification, { type NotificationData } from "../Components/Notification";
import { createContext, useContext, useState } from 'react';

const FadeContext = createContext<() => void>(() => {});

export function AccountPage() {

    const [visible, setVisible] = useState(true);
    //const [notification, setNotification] = useState<NotificationData | null>(null);
    const location = useLocation();

    console.log(location.pathname);

    const fadeDiv = () => {
        setVisible(false);
        setTimeout(() => {
            setVisible(true);
        }, 500);
    };

    return(
        <FadeContext.Provider value={fadeDiv}>
            <div className="flex place-content-center h-screen absolute w-screen">
                <div className={`flex flex-wrap bg-neutral-300 dark:bg-neutral-800 rounded-lg self-center md:w-1/4 w-11/12 text-center drop-shadow-2xl drop-shadow-rose-500/50 transition-all
                        ${location.pathname === "/account/register" ? "h-[30rem]" : location.pathname === "/account/login" ? "h-96" : ""}
                `}>
                    <div className={`flex flex-wrap w-max h-max transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
                        <Outlet />
                    </div>
                </div>
                {/* {notification && (<Notification message={notification.message} title={notification.title} type={notification.type} onClose={() => setNotification(null)}/>)} */}
            </div>
        </FadeContext.Provider>
    )
}

export function useFadeContext() {
    return useContext(FadeContext);
}