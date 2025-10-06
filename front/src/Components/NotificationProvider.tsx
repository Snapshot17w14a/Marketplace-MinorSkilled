import { createContext, useContext, useState } from "react";
import Notification from "./Notification";

const notificationContext = createContext<(notifDesc: NotificationDescription) => void>(() => {});

export default function NotificationProvider({ children } : { children: React.ReactNode}){

    const [notifications, setNotifications] = useState<{ id:number, descObj: NotificationDescription}[]>();

    const addNotification = (notifDesc: NotificationDescription) => {
        if (notifications !== undefined) {
            setNotifications([
                ...notifications,
                { id: Date.now(), descObj: notifDesc }
            ])
        }
        else {
            setNotifications([{ id: Date.now(), descObj: notifDesc }]);
        }
    }

    const removeNotification = (id: number) => {
        if (notifications === undefined) return;

        const remainingNotifications = notifications.filter(notifObject => {
            return(notifObject.id !== id)
        })

        setNotifications(remainingNotifications);
    }

    return(
        <notificationContext.Provider value={addNotification}>
            {children}
            {
                <div className="absolute bottom-2 right-2 flex flex-col-reverse">
                    {notifications !== undefined ? notifications.map(notification => {
                            return(<Notification key={notification.id} info={notification} removeCallback={removeNotification} />)
                        }) : <></>
                    }
                </div>
            }
        </notificationContext.Provider>
    )
}

export function useNotification(){
    return useContext(notificationContext);
}

export type NotificationDescription = {
    type: "info" | "warning" | "error",
    header: string,
    message: string
};