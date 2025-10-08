import { useRef, useState, type FormEvent } from 'react'
import { postAnonymus, SetJWToken } from '../BackendClient';
import Button from '../Components/Button';
import { useFadeContext } from './AccountPage';
import { useNavigate } from 'react-router-dom';
import { useNotification, type NotificationDescription } from '../Components/NotificationProvider';

export default function Login() {
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const loginRef = useRef<HTMLButtonElement | null>(null);

    const [loginButtonDisabled, setLoginDisable] = useState(false);
    
    const addNotification = useNotification();
    const navigate = useNavigate();
    const fade = useFadeContext();

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
        
        const notFoundHandler = () => {
            const notifDesc: NotificationDescription = {
                type: "error",
                header: "Cound not find user!",
                message: "Password and Username do not match any account registered"
            }
            addNotification(notifDesc);
            hasErrored = true;
        };

        try {
            var response = await postAnonymus('User/Login', loginReqest, notFoundHandler);
            if (hasErrored) return;
            SetJWToken(response);
            navigate("/");
        }
        catch (error) {
            const notifDesc: NotificationDescription = {
                type: "error",
                header: "Something went wrong!",
                message: `${error}`
            };
            addNotification(notifDesc);
        }
        finally {
            loginRef.current.disabled = false;
            setLoginDisable(false);
        }
    };

    return(
        <div className="flex content-start flex-wrap w-full h-full text-center py-8 px-12">
            <Button className="mb-6 w-16 text-2xl font-bold" onClick={() => {fade(); setTimeout(() => history.back(), 500)}}>🡐</Button>
            <h1 className="basis-full text-4xl font-bold mb-6">Enter account details</h1>
            <form className="flex flex-wrap basis-full min-w-0" onSubmit={handleSubmit}>
                <div className="flex basis-full flex-wrap min-w-0 text-start">
                    <input className="textinput-standard" type="email" placeholder="Email address"  required    ref={emailRef}></input>
                    <input className="textinput-standard" type="text"  placeholder="Password"       required    ref={passwordRef} minLength={8}></input>
                </div>
                <div className="flex justify-center basis-full mt-4">
                    <Button variant='filled' className="py-2 px-4 disabled:w-36 w-20 transition-all hover:scale-110 disabled:bg-rose-950 disabled:cursor-not-allowed disabled:scale-100" type="submit" ref={loginRef}>
                        <svg className={`-mr-5 size-5 animate-spin text-blue-500 relative float-left transition-discrete ${loginButtonDisabled ? "" : "hidden"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Log in
                    </Button>
                </div>
            </form>
        </div>
    )
}

type LoginRequest = {
    email: string,
    password: string
}