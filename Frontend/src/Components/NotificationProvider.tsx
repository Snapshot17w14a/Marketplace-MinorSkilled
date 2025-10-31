import { createContext, useContext, useState } from "react";
import Notification from "./Notification";

const notificationContext = createContext<(notifDesc: NotificationDescription) => void>(() => {});

export default function NotificationProvider({ children } : { children: React.ReactNode}){

    const [notifications, setNotifications] = useState<{ id:number, descObj: NotificationDescription}[]>([]);

    const addNotification = (notifDesc: NotificationDescription) => {
        setNotifications(prev => [...prev, { id: Date.now(), descObj: notifDesc }])
    }

    const removeNotification = (notification: NotificationDescription) => {
        if (!notifications) return;

        const remainingNotifications = notifications.filter(notifObject => {
            return(notifObject.descObj !== notification)
        })

        setNotifications(remainingNotifications);
    }

    return(
        <notificationContext.Provider value={addNotification}>
            {children}
            <div className="absolute bottom-2 right-2 flex flex-col-reverse">
                {notifications && notifications.map(notification => {
                        return(<Notification key={notification.id + Math.random()} info={notification} removeCallback={removeNotification} />)
                    })
                }
            </div>
        </notificationContext.Provider>
    )
}

export function useNotification(){
    return useContext(notificationContext);
}

export interface NotificationDescription {
    type: "info" | "warning" | "error",
    header: string,
    message: string
};