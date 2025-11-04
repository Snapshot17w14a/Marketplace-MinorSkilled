export default function SidePanel({ topPadding = 0, innerContainerClass, enabled = false, children } : { topPadding?: number, innerContainerClass?: string, enabled: boolean, children?: React.ReactNode }) {
    return(
        <div className={"fixed w-full sm:w-1/3 top-16 right-0 z-20 transition-transform duration-500"} style={{height: `${window.innerHeight - topPadding * 4}px`, top: `${topPadding * 4}px` ,transform: `translateX(${enabled ? 0 : 100}%)`}}>
            <div className={"h-full bg-(--dark) border-2 border-(--light-dark) rounded-lg " + innerContainerClass}>
                {children}
            </div>
        </div>
    )
}