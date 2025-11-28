import { useRef, type FormEvent } from 'react'
import Button from '../Components/Button';
import { useFade } from './AccountPage';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../Components/NotificationProvider';
import { requestJWToken, type LoginRequest } from '../Auth';
import { FetchError } from '../classes/FetchError';
import responseCodes from '../types/responseCodes';

export default function Login() {
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const loginRef = useRef<HTMLButtonElement | null>(null);
    
    const notify = useNotify();
    const navigate = useNavigate();
    const fade = useFade();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(loginRef.current === null) return;
        loginRef.current.disabled = true;

        const loginReqest: LoginRequest = {
            email: emailRef.current!.value,
            password: passwordRef.current!.value
        }

        try {
            await requestJWToken(loginReqest, true);
            fade();
            setTimeout(() => {
                navigate("/account/enableMFA");
            }, 500)
        }
        catch (error) {
            if (error instanceof FetchError) {
                switch(error.code) {
                    case responseCodes.NotFound:
                        notify({
                            header: "User could not be found!",
                            message: "The user with the given credentials could not be found. Please check your login details!",
                            type: 'error'
                        })
                        break;
                    case responseCodes.Forbidden:
                        notify({
                            header: "Wrong credentials!",
                            message: "The provided email and password do not match. Try again, or click forgot password to reset your password.",
                            type: 'error'
                        });
                        break;
                    case responseCodes.Unauthorized:
                        fade();
                        setTimeout(() => {
                            navigate('/account/enterMFA', {
                                state: {
                                    email: loginReqest.email,
                                    password: loginReqest.password
                                }
                            });
                        }, 500);
                        break;
                }
            } else {
                notify({
                    header: "Something went wrong!",
                    message: "An error occured while trying to log you in! Please try again later!",
                    type: 'error'
                })
            }

            loginRef.current.disabled = false;
        }
    };

    return(
        <div className="flex content-start flex-wrap w-full h-full text-center py-8 px-12">
            <Button className="mb-6 w-16 text-2xl font-bold" onClick={() => {fade(); setTimeout(() => history.back(), 500)}}>🡐</Button>
            <h1 className="basis-full text-4xl font-bold mb-6">Enter account details</h1>
            <form className="flex flex-wrap basis-full min-w-0" onSubmit={handleSubmit}>
                <div className="flex basis-full flex-wrap min-w-0 text-start">
                    <input className="textinput-standard my-4" type="email" placeholder="Email address"  required    ref={emailRef}></input>
                    <input className="textinput-standard my-4" type="text"  placeholder="Password"       required    ref={passwordRef} minLength={8}></input>
                    <div className='text-right basis-full'>
                        <a onClick={() =>{fade(); setTimeout(() => navigate("/account/forgotPassword"), 500);}} className='underline hover:cursor-pointer select-none'>Forgot password?</a>
                    </div>
                </div>
                <div className="flex justify-center basis-full mt-4">
                    <Button variant='filled' className="py-2 px-4 disabled:w-36 w-20 transition-all hover:scale-110 disabled:bg-rose-950 disabled:cursor-not-allowed disabled:scale-100" type="submit" ref={loginRef}>
                        <svg className={`-mr-5 size-5 animate-spin text-blue-500 relative float-left transition-discrete ${loginRef.current?.disabled ? "" : "hidden"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Log in
                    </Button>
                </div>
            </form>
        </div>
    )
}