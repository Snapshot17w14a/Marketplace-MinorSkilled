import { createContext, useContext, useState, type JSX } from "react";
import Notification from "./Notification";

const notificationContext = createContext<(notifDesc: NotificationDescription) => void>(() => {});

export default function NotificationProvider({ children } : { children: React.ReactNode}){

    const [notifications, setNotifications] = useState<{ id: number, descObj: NotificationDescription, component: JSX.Element}[]>([]);

    const addNotification = (notifDesc: NotificationDescription) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => {
            return([...prev, {
                id: id,
                descObj: notifDesc,
                component: <Notification key={id} info={{ id: id, descObj: notifDesc }} removeCallback={removeNotification}/>
            }])
        })
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
                        return(notification.component)
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