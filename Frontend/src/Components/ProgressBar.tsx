export default function ProgressBar( { progress = 0, className = ''} ){
    return(
        <div className={"rounded-lg h-2 ring-2 ring-(--light-dark) overflow-clip bg-(--dark-rose) " + className}>
            <div className="h-full transition-width bg-rose-500" style={{ width: `${(progress * 100)}%` }} />
        </div>
    )
}