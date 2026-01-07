import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "standard" | "warning" | "filled";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "standard", ...rest}, ref) => {

    const styles: { [id: string]: string } = {
        standard: "cursor-pointer rounded-lg bg-neutral-800 transition duration-300 hover:bg-white py-3   ease-in-out font-bold hover:text-black border-2 border-white",
        filled:   "rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 py-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:brightness-110 hover:shadow-rose-500/40 active:scale-[0.98]"
    }

    return(
        <button {...rest} className={`${styles[variant]} ` + rest.className} ref={ref} disabled={rest.disabled}>
            {rest.children}
        </button>
    )
});

export default Button;