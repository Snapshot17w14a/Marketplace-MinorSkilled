import type { JSX } from "react";

export default function PillButton({ className, icon, text = '', onClick } : { className?: string, icon: JSX.Element, text: string, onClick?: () => void }) {
    return(
        <button className={"sm:space-x-2 hover:border-rose-500 hover:text-rose-500 transition-colors duration-300 rounded-lg border border-(--light-dark) py-1 px-2 flex items-center cursor-pointer " + className} onClick={onClick}>
            {icon}
            <p className='text-sm hidden sm:block'>{text}</p>
        </button>
    )
}