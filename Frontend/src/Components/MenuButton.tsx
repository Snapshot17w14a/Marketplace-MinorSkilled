import type { JSX } from "react";

export function MenuButton({ icon, title, className = '', onClick } : { icon: JSX.Element, title: string, className?: string, onClick: () => void }){
    return(
        <div className={"w-full flex p-2 space-x-2 select-none rounded-lg active:scale-[0.98] transition-all " + className} onClick={onClick}>
            {icon}
            <p>{title}</p>
        </div>
    )
}