import { useRef, useState, type FormEvent } from 'react'
import Notification, { type NotificationData } from '../Components/Notification'
import { sendData, SetJWToken } from '../BackendClient';
import Button from '../Components/Button';

export default function Login(){

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const loginRef = useRef<HTMLButtonElement | null>(null);

    const [loginButtonDisabled, setLoginDisable] = useState(false);
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(loginRef.current === null) return;
        loginRef.current.disabled = true;
        setLoginDisable(true);

        const loginReqest: LoginRequest = {
            email: emailRef.current!.value,
            password: passwordRef.current!.value
        }

        var hasErrored = false;
        
        const notFoundHandler = (response: Response) => {
            console.log(`User not found ${response.status}`);  
            hasErrored = true;
        };

        try{
            var response = await sendData('User/Login', loginReqest, notFoundHandler);
            if (hasErrored) return;
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
        finally{
            loginRef.current.disabled = false;
            setLoginDisable(false);
        }
    };

    const [notification, setNotification] = useState<NotificationData | null>(null);

    return(
        <div className="flex place-content-center text-black dark:text-white h-screen font-[Sansation]">
            <div className="flex flex-wrap bg-neutral-300 dark:bg-neutral-800 rounded-lg h-min self-center md:w-1/4 w-1/2 text-center drop-shadow-2xl drop-shadow-rose-500/50">
                <Button className="mt-8 ml-12 w-16 text-2xl" type="button" onClick={() => history.back()}>🡐</Button>
                <h1 className="text-4xl font-bold mt-8 basis-full">Enter login details</h1>
                <div className="flex justify-center-safe">
                    <form className="flex flex-wrap basis-full justify-center-safe m-4" onSubmit={handleSubmit}>
                    <div className="flex flex-wrap basis-full justify-center-safe text-start">
                        <input className="textinput-standard" id="email" ref={emailRef} type="email" placeholder="Email address" required/>
                        <input className="textinput-standard" id="password" ref={passwordRef} type="password" placeholder="Password" minLength={8} required/>
                    </div>
                    <Button variant='filled' className="mx-8 py-2 px-4 my-4 disabled:w-36 w-20 transition-all hover:scale-110 disabled:bg-rose-950 disabled:cursor-not-allowed disabled:scale-100" type="submit" ref={loginRef}>
                        <svg className={`-mr-5 size-5 animate-spin text-blue-500 relative float-left transition-discrete ${loginButtonDisabled ? "" : "hidden"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Log in
                    </Button>
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