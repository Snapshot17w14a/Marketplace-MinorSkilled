import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationDescription } from "./NotificationProvider";
import { useHover } from "@uidotdev/usehooks";

export default function Notification({ info, removeCallback }: { info: { id: number, descObj: NotificationDescription}, removeCallback: (id: NotificationDescription) => void}) {

    const [ref, hover] = useHover();

    const [visibility, setVisibility] = useState<boolean>(true);
    const autocloseRef = useRef<number | null>(null);
    const fadeRef = useRef<number | null>(null);

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

    const stopTimeouts = () => {
        if (autocloseRef.current) {
            window.clearTimeout(autocloseRef.current);
            autocloseRef.current = null;
        }

        if (fadeRef.current) {
            window.clearTimeout(fadeRef.current);
            fadeRef.current = null;
        }

        setVisibility(true);
    }

    const startAutoclose = useCallback(() => {
        const timeoutId = window.setTimeout(() => {
            close();
        }, 1000);
        autocloseRef.current = timeoutId;
    }, [])

    useEffect(() => {
        return () => {
            if (autocloseRef.current) {
                window.clearTimeout(autocloseRef.current);
                autocloseRef.current = null;
            }
            if (fadeRef.current) {
                window.clearTimeout(fadeRef.current);
                fadeRef.current = null;
            }
        }
    }, [])

    useEffect(() => {
        if (hover) {
            stopTimeouts();
        }
        else {
            if (autocloseRef.current) return;
            startAutoclose();
        }
    }, [hover, startAutoclose])

    const close = () => {
        setVisibility(false);
        const timeoutId = window.setTimeout(() => {
            removeCallback(info.descObj);
        }, 500)
        fadeRef.current = timeoutId;
    }

    const instantClose = () => {
        if (autocloseRef.current) {
            window.clearTimeout(autocloseRef.current);
            autocloseRef.current = null;
        }
        setVisibility(false);
        const timeoutId = window.setTimeout(() => {
            removeCallback(info.descObj);
        }, 500);
        fadeRef.current = timeoutId;
    }

    return(
        <div ref={ref} className={styles[info.descObj.type] + `basis-full mt-2 p-3 rounded-lg border-2 text-black select-none transition-opacity duration-500 w-md text-pretty`} style={{opacity: visibility ? 1 : 0}}>
            <button className={`float-right font-bold px-1 rounded-lg transition-colors ${closeHoverStyles[info.descObj.type]}`} onClick={instantClose}>X</button>
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