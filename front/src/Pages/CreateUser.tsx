import { useRef, useState, type FormEvent } from "react";
import { sendData } from "../BackendClient";
import Notification, { type NotificationData } from "../Components/Notification";
import Button from "../Components/Button";
import { useNavigate } from "react-router-dom";

export default function CreateUser(){
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const registerButtonRef = useRef<HTMLButtonElement>(null);

    const [registerButtonDisabled, setRegisterDisable] = useState(false);

    const [notification, setNotification] = useState<NotificationData | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (registerButtonRef.current === null) return;
        registerButtonRef.current.disabled = true;
        setRegisterDisable(true);

        if (!CheckIfUndefined([emailRef, passwordRef, usernameRef])) return;

        let userData: CreateUserRequestData = {
            email: emailRef.current!.value,
            password: passwordRef.current!.value,
            username: usernameRef.current!.value
        }

        try{
            var responseData = await sendData("User/CreateUser", userData);
            console.log(responseData);

            window.location.replace("http://localhost:5173/login");
        }
        catch (error){
            console.log(error);
            const errorNotification: NotificationData = {
                title: "Error creating account",
                message: "An error occured when trying to create an account: " + error,
                type: "error",
                onClose: () => {}
            };
            setNotification(errorNotification);
        }
        finally{
            registerButtonRef.current.disabled = false;
            setRegisterDisable(false);
        }
    };

    function CheckIfUndefined(refObjects: React.RefObject<HTMLInputElement | null>[]): boolean {
        refObjects.forEach(element => {
            if (element.current!.value === undefined || element.current!.value === ""){
                setNotification({
                    title: "Field was empty!",
                    message: `The ${element.current!.id} was left empty.`,
                    type: "error",
                    onClose: () => {}
            });
                return false;
            }
        });
        return true;
    }

    return(
        <div className="flex place-content-center text-black dark:text-white h-screen font-[Sansation]">
            <div className="flex flex-wrap bg-neutral-300 dark:bg-neutral-800 rounded-lg h-min self-center md:w-1/4 w-1/2 text-center drop-shadow-2xl drop-shadow-rose-500/50">
                <Button className="mt-8 ml-12 w-16 text-2xl" onClick={() => history.back()}>🡐</Button>
                <h1 className="text-4xl font-bold mt-6 basis-full">Let's create an account!</h1>
                <div className="flex justify-center-safe">
                    <form className="flex flex-wrap basis-full justify-center-safe m-4" onSubmit={handleSubmit}>
                        <div className="flex flex-wrap basis-full justify-center-safe text-start">
                            <input className="textinput-standard" id="email" ref={emailRef} type="email" placeholder="Email address" required/>
                            <input className="textinput-standard" id="password" ref={passwordRef} type="password" placeholder="Password" minLength={8} required/>
                            <small className="basis-full mx-8 px-2">Password must be at least 8 characters long</small>
                            <input className="textinput-standard" id="username" ref={usernameRef} type="text" placeholder="Username" required/>
                        </div>
                        <div className="flex justify-between basis-full">
                            <Button variant="filled" className="mx-8 py-2 px-4 my-4 basis-1/2 hover:scale-110 disabled:bg-rose-950 disabled:cursor-not-allowed disabled:scale-100" type="submit" ref={registerButtonRef}>
                                {registerButtonDisabled ? 
                                    <svg className="-mr-5 size-5 animate-spin text-blue-500 relative float-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg> :
                                    <></>
                                }
                                Create Account
                            </Button>
                            <Button className="mx-8 py-2 px-4 my-4" type="button" onClick={() => navigate("/login")}>Log in</Button>
                        </div>
                    </form>
                </div>
            </div>
            {notification && (<Notification message={notification.message} title={notification.title} type={notification.type} onClose={() => setNotification(null)}/>)}
        </div>   
    )
}

type CreateUserRequestData = {
    email: string;
    password: string;
    username: string;
}