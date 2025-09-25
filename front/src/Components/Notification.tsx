export interface NotificationData {
    title: string;
    message: string;
    type?: "error" | "message" | "success";
    onClose: () => void;
}

export default function Notification(props: NotificationData){
    return(
        <div className={`${props.type === 'error' ? "bg-red-700" : props.type === 'success' ? "bg-green-600" : "bg-blue-400"} absolute rounded-xl right-4 bottom-4 w-xs h-32 text-start p-4`}>
            <button className="float-right size-6 cursor-pointer" type="button" onClick={props.onClose}>X</button>
            <h1 className="text-2xl font-bold">{props.title}</h1>
            <p className="text-sm block basis-full">{props.message}</p>
        </div>
    )
}