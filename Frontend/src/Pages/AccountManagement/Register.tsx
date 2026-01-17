import { useRef, type FormEvent } from "react";
import { postAnonymous } from "../../BackendClient";
import Button from "../../Components/Button";
import { useNavigate } from "react-router-dom";
import { useFade as useFade } from "./AccountPage";
import { useNotify as useNotify } from "../../Components/NotificationProvider";
import { FetchError } from "../../classes/FetchError";
import responseCodes from "../../types/responseCodes";

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
            await postAnonymous("users/Create", userData);

            navigate("/account/login");
        }
        catch (error){
            if (error instanceof FetchError) {
                switch(error.code) {
                    case responseCodes.Conflict:
                        notify({
                            header: "Conflicting information!",
                            message: error.error,
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
        <div className="w-full h-full">

            <div className="mb-6">
                <h2 className="text-2xl font-bold">Let's create an account!</h2>
                <p className="text-sm text-neutral-400">With an account you can create listings, and message others for more information</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>

                <div className="space-y-1">
                    <label className="label-standard">Email address</label>
                    <input 
                        className="textinput-standard" 
                        type="email" 
                        placeholder="john@example.com"  
                        required    
                        ref={emailRef}
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="label-standard">Password</label>
                        <small className="label-standard">Password must be at least 8 characters long</small>
                    </div>
                    <input 
                        className="textinput-standard" 
                        type="text"  
                        placeholder="••••••••"       
                        required    
                        ref={passwordRef} 
                        minLength={8}
                    />
                </div>

                <div className="space-y-1">
                    <label className="label-standard">Username</label>
                    <input 
                        className="textinput-standard" 
                        type="text"  
                        placeholder="John Smith"       
                        required    
                        ref={usernameRef}
                    />
                </div>

                <Button variant="filled" className="w-full">Register</Button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
                Already have an account? <a className="cursor-pointer text-white underline decoration-rose-500 underline-offset-4 hover:text-rose-400" onClick={() => fade('/account/login')}>Log in</a>
            </p>
        </div>
    )
}

type CreateUserRequestData = {
    email: string;
    password: string;
    username: string;
}