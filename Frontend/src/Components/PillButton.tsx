import type { JSX } from "react";

type PillButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
    text: string,
    icon: JSX.Element
}

export default function PillButton(props: PillButtonProps) {
    return(
        <button className={"sm:space-x-2 hover:border-rose-500 hover:text-rose-500 transition-colors duration-300 rounded-lg border border-(--light-dark) py-1 px-2 flex items-center cursor-pointer " + props.className} onClick={props.onClick}>
            {props.icon}
            <p className='text-sm hidden sm:block'>{props.text}</p>
        </button>
    )
}