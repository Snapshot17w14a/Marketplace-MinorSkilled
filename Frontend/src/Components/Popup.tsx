import Button from "./Button";
import type { PopupContent } from "./PopupProvider";

export default function Popup({ content, remove } : { content: PopupContent, remove: () => void }) {
    return(
        <div className="max-w-md bg-(--dark) ring-1 ring-(--light-dark) rounded-lg py-4 px-8">

            <div className="mb-4 space-y-2">
                <h2 className="text-2xl font-bold">{content.title}</h2>
                <p className="text-sm text-neutral-400">{content.message}</p>
            </div>

            <div className="mx-auto space-x-4">
                <Button className="w-24" variant="filled"  onClick={() => {content.onAccept(); remove()}}>Accept</Button>
                <Button className='w-24' variant="standard" onClick={() => remove()}>Cancel</Button>
            </div>

        </div>
    )
}