import type { JSX } from "react";

export function PageButton({ icon, title, radioName, onClick }: { icon: JSX.Element; title: string; radioName: string; onClick?: () => void; }) {
    return (
        <label id={title.toLocaleLowerCase()} className="flex items-center justify-between select-none has-checked:bg-(--light-dark) hover:bg-(--mid-dark) p-2 rounded-lg transition-all active:scale-[0.98] has-checked:border-l-4 border-rose-500" onClick={onClick}>
            <div className="flex gap-2">
                {icon}
                <p>{title}</p>
            </div>
            <input className="hidden" type="radio" name={radioName} />
        </label>
    );
}
