import type { JSX } from "react";

type PillButtonProps = React.InputHTMLAttributes<HTMLInputElement> & {
    text: string,
    icon: JSX.Element
}

export default function PillInput(props: PillButtonProps) {
    return(
        <label className={"sm:space-x-2 hover:border-rose-500 hover:text-rose-500 transition-colors duration-300 rounded-lg border border-(--light-dark) py-1 px-2 flex items-center cursor-pointer " + props.className}>
            {props.icon}
            <p className='text-sm hidden sm:block'>{props.text}</p>
            <input className="hidden" type={props.type} onChange={props.onChange} multiple={props.multiple} accept={props.accept}/>
        </label>
    )
}