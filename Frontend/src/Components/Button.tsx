import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "standard" | "warning" | "filled";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant = "standard", ...rest}, ref) => {

    const styles: { [id: string]: string } = {
        standard: "cursor-pointer rounded-lg bg-neutral-800 transition duration-300 hover:bg-white    ease-in-out font-bold hover:text-black border-2 border-white",
        filled:   "cursor-pointer rounded-lg bg-rose-600    transition duration-300 hover:bg-rose-900 ease-in-out font-bold"
    }

    return(
        <button {...rest} className={`h-min ${styles[variant]} ` + rest.className} ref={ref}>
            {rest.children}
        </button>
    )
});

export default Button;