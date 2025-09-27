import { useRef, useState, type FormEvent } from 'react'
import Notification, { type NotificationData } from '../Components/Notification'
import { Link } from 'react-router-dom'
import { sendData, SetJWToken } from '../BackendClient';

export default function Login(){

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const loginReqest: LoginRequest = {
            email: emailRef.current!.value,
            password: passwordRef.current!.value
        }

        try{
            var response = await sendData('User/Login', loginReqest);
            SetJWToken(response);
            window.location.replace("http://localhost:5173/")
        }
        catch (error){
            const errorNotification: NotificationData = {
                title: "Error logging in",
                message: "An error occured when trying to login: " + error,
                type: "error",
                onClose: () => {}
            };
            setNotification(errorNotification);
        }
    };

    const [notification, setNotification] = useState<NotificationData | null>(null);

    return(
        <div className="flex place-content-center text-black dark:text-white h-screen font-[Sansation]">
            <div className="flex flex-wrap bg-neutral-300 dark:bg-neutral-800 rounded-lg h-min self-center md:w-1/4 w-1/2 text-center drop-shadow-2xl drop-shadow-rose-500/50">
                <button className="cursor-pointer rounded-lg bg-neutral-800 hover:bg-white hover:text-black transition duration-300 font-bold text-2xl border-2 border-white mt-8 ml-12 w-16" type="button" onClick={() => history.back()}>🡐</button>
                <h1 className="text-4xl font-bold mt-8 basis-full">Enter login details</h1>
                <div className="flex justify-center-safe">
                    <form className="flex flex-wrap basis-full justify-center-safe m-4" onSubmit={handleSubmit}>
                    <div className="flex flex-wrap basis-full justify-center-safe text-start">
                        <input className="bg-neutral-300 dark:bg-neutral-800 mx-8 my-4 py-2 px-4 rounded-lg caret-rose-500 ring-2 ring-white invalid:ring-rose-500 focus:ring-rose-300 focus:outline-none basis-full transition ease-in-out duration-300" id="email" ref={emailRef} type="email" placeholder="Email address" required/>
                        <input className="bg-neutral-300 dark:bg-neutral-800 mx-8 my-4 py-2 px-4 rounded-lg caret-rose-500 ring-2 ring-white invalid:ring-rose-500 focus:ring-rose-300 focus:outline-none basis-full transition ease-in-out duration-300" id="password" ref={passwordRef} type="password" placeholder="Password" minLength={8} required/>
                    </div>
                    <button className="bg-rose-600 mx-8 py-2 px-4 my-4 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-rose-900 font-bold" type="submit">Log in</button>
                </form>
                </div>
            </div>
                {notification && (<Notification message={notification.message} title={notification.title} type={notification.type} onClose={() => setNotification(null)}/>)}
        </div>
    )
}

type LoginRequest = {
    email: string,
    password: string
}