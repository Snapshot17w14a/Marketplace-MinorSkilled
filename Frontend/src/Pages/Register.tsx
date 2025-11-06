import { useRef, type FormEvent } from "react";
import { postAnonymous } from "../BackendClient";
import Button from "../Components/Button";
import { useNavigate } from "react-router-dom";
import { useFade as useFade } from "./AccountPage";
import { useNotify as useNotify } from "../Components/NotificationProvider";
import { FetchError } from "../classes/FetchError";

export default function Register(){
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const registerButtonRef = useRef<HTMLButtonElement>(null);

    const notify = useNotify();
    const navigate = useNavigate();
    const fade = useFade();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (registerButtonRef.current === null) return;
        registerButtonRef.current.disabled = true;

        if (!CheckIfUndefined([emailRef, passwordRef, usernameRef])) return;

        let userData: CreateUserRequestData = {
            email: emailRef.current!.value,
            password: passwordRef.current!.value,
            username: usernameRef.current!.value
        }

        try{
            await postAnonymous("User/Create", userData);

            navigate("/account/login");
        }
        catch (error){
            if (error instanceof FetchError) {
                switch(error.code) {
                    case 404:
                        notify({
                            header: "User could not be found!",
                            message: "The user with the given credentials could not be found. Please check your login details!",
                            type: 'error'
                        })
                }
            } else {
                notify({
                    header: "Something went wrong!",
                    message: "An error occured while trying to log you in! Please try again later!",
                    type: 'error'
                })
            }
            
            registerButtonRef.current.disabled = false;
        }
    };

    function CheckIfUndefined(refObjects: React.RefObject<HTMLInputElement | null>[]): boolean {
        return refObjects.every(ref => ref.current !== undefined);
    }

    return(
        <div className="flex flex-wrap w-full h-full text-center py-8 px-12">
            <Button className="mb-6 w-16 text-2xl font-bold" onClick={() => {fade(); setTimeout(() => history.back(), 500)}}>🡐</Button>
            <h1 className="basis-full text-4xl font-bold mb-6">Let's create an account!</h1>
            <form className="flex flex-wrap basis-full min-w-0" onSubmit={handleSubmit}>
                <div className="flex basis-full flex-wrap min-w-0 text-start">
                    <input className="textinput-standard my-4" type="email" placeholder="Email address"  required    ref={emailRef}></input>
                    <input className="textinput-standard my-4" type="text"  placeholder="Password"       required    ref={passwordRef} minLength={8}></input>
                    <small className="basis-full -mt-2 pl-4">Password must be at least 8 characters long</small>
                    <input className="textinput-standard my-4" type="text"  placeholder="Username"       required    ref={usernameRef}></input>
                </div>
                <div className="flex flex-wrap justify-between basis-full mt-4">
                    <Button className="basis-2/3 px-4 py-2 hover:scale-110 disabled:bg-rose-950 disabled:cursor-not-allowed disabled:scale-100" variant="filled" type="submit" ref={registerButtonRef}>
                        {registerButtonRef.current?.disabled ? 
                                <svg className="-mr-5 size-5 animate-spin text-blue-500 relative float-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg> :
                                <></>
                        }
                        Create account
                    </Button>
                    <Button className="px-4 py-2" onClick={() => {fade(); setTimeout(() => navigate("/account/login"), 500)}} type="button">
                        Login
                    </Button>
                </div>
            </form>
        </div>
    )
}

type CreateUserRequestData = {
    email: string;
    password: string;
    username: string;
}