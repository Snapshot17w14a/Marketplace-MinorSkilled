import { useCallback, useEffect, useState } from "react";
import type { NotificationDescription } from "./NotificationProvider";

export default function Notification({ info, removeCallback }: { info: { id: number, descObj: NotificationDescription}, removeCallback: (id: NotificationDescription) => void}) {

    const remove = removeCallback;

    const [visibility, setVisibility] = useState<boolean>(true);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [autocloseTimeout, setAutocloseTimeout] = useState<number>();
    const [fadeTimeout, setFadeTimeout] = useState<number>();

    const styles: { [id: string]: string } = {
        info: "bg-(--info)/80 border-(--info) ",
        warning: "bg-(--warning)/80 border-(--warning) ",
        error: "bg-(--error)/80 border-(--error) "
    }

    const closeHoverStyles: { [id: string]: string } = {
        info: "hover:bg-(--info)",
        warning: "hover:bg-(--warning)",
        error: "hover:bg-(--error)"
    }

    const startAutoclose = useCallback(() => {
        const timeout = window.setTimeout(() => {
            animateRemove();
        }, 5000);
        setAutocloseTimeout(timeout);
    }, []);

    useEffect(() => {
        if (isFocused) {
            window.clearTimeout(autocloseTimeout);
            window.clearTimeout(fadeTimeout);
            setVisibility(true);
            console.log("sotp");
        }
        else {
            startAutoclose();
        }
    }, [isFocused])

    const animateRemove = () => {
        setVisibility(false);
        const timeout = window.setTimeout(() => {
            remove(info.descObj);
        }, 500);
        setFadeTimeout(timeout);
    }

    return(
        <div className={styles[info.descObj.type] + `basis-full mt-2 p-3 rounded-lg border-2 text-black select-none transition-opacity duration-500 ${visibility ? "opacity-100" : "opacity-0"} w-md text-pretty`} onPointerLeave={() => setIsFocused(false)} onPointerEnter={() => setIsFocused(true)}>
            <button className={`float-right font-bold px-1 rounded-lg transition-colors + ${closeHoverStyles[info.descObj.type]}`} onClick={animateRemove}>X</button>
            <h1 className="font-bold text-2xl">{info.descObj.header}</h1>
            <p className="text-base">{info.descObj.message}</p>
        </div>
    )
}

export function CreateNotificationDescriptor(type: "info" | "warning" | "error", header: string, message: string): NotificationDescription {
    const desc: NotificationDescription = {
        type: type,
        header: header,
        message: message
    }
    return desc;
}