import { useRef, type FormEvent } from 'react'
import Button from '../../Components/Button';
import { useFade } from './AccountPage';
import { useNavigate } from 'react-router-dom';
import { useNotify } from '../../Components/NotificationProvider';
import { requestJWToken, type LoginRequest } from '../../Auth';
import { FetchError } from '../../classes/FetchError';
import responseCodes from '../../types/responseCodes';

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
            fade("/account/enableMFA");
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
        <>
            <div className='mb-6'>
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className='text-sm text-neutral-400'>Enter your credentials to access your account</p>
            </div>

            <form className='space-y-4' onSubmit={handleSubmit}>

                <div className='space-y-1'>
                    <label className='label-standard'>Email address</label>
                    <input 
                        className="textinput-standard" 
                        type="email" 
                        placeholder="john@example.com"  
                        required    
                        ref={emailRef}
                    />
                </div>

                <div className='space-y-1'>
                    <div className='flex justify-between'>
                        <label className='label-standard'>Password</label>
                        <a className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer" onClick={() => fade('/account/forgotPassword')}>Forgot?</a>
                    </div>
                    <input 
                        className="textinput-standard" 
                        type="password"
                        placeholder="••••••••"
                        required    
                        ref={passwordRef} 
                        minLength={8}
                    />
                </div>

                <Button variant='filled' className='w-full' type='submit' ref={loginRef}>Log in</Button>
            </form>

            <p className='mt-6 text-sm text-neutral-500 text-center'>
                Don't have an account? <a className="cursor-pointer text-white underline decoration-rose-500 underline-offset-4 hover:text-rose-400" onClick={() => fade('/account/register')}>Sign up</a>
            </p>
        </>
    )
}