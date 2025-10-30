import { useRef, useState, type FormEvent } from "react";
import { postAnonymous } from "../BackendClient";
import Button from "../Components/Button";
import { useNavigate } from "react-router-dom";
import { useFadeContext } from "./AccountPage";
import { useNotification } from "../Components/NotificationProvider";

export default function Register(){
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const registerButtonRef = useRef<HTMLButtonElement>(null);

    const [registerButtonDisabled, setRegisterDisable] = useState(false);

    const notify = useNotification();
    const navigate = useNavigate();
    const fade = useFadeContext();

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
            var responseData = await postAnonymous("User/Create", userData);
            console.log(responseData);

            navigate("/account/login");
        }
        catch (error){
            console.log(error);
            notify({
                type: "error",
                header: "Something went wrong!",
                message: `${error}`
            });
        }
        finally{
            registerButtonRef.current.disabled = false;
            setRegisterDisable(false);
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
                        {registerButtonDisabled ? 
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