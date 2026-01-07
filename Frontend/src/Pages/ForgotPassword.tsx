import { useRef, useState, type FormEvent } from "react";
import Button from "../Components/Button";
import { useFade } from "./AccountPage";
import { postAnonymous } from "../BackendClient";
import { useNotify } from "../Components/NotificationProvider";
import { FetchError } from "../classes/FetchError";
import responseCodes from "../types/responseCodes";

export default function ForgotPassword() {

    const fade = useFade();
    const nofity = useNotify();

    const emailRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const submitReset = async (e: FormEvent) => {
        e.preventDefault();

        if (!emailRef.current) return;

        try {
            await postAnonymous('users/RequestResetToken', { email: emailRef.current.value});
        }
        catch (e) {
            if (e instanceof(FetchError)){
                switch(e.code) {
                    case responseCodes.Forbidden:
                        nofity({
                            header: "Request error!",
                            message: "A token already exists for the given email address, please check your inbox and use the token. If you cannot find the email, kindly check your spam folder.",
                            type: 'error'
                        });
                        return;
                }
            }
        }
        fade();
        setTimeout(() => {
            setSuccess(true);
        }, 500);
    }

    return(
        <>
            {success ? <CheckInbox /> :
            <>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Reset password</h2>
                    <p className="text-sm text-neutral-400">Enter the email address associated with your account, and we will send you a link to reset your password!</p>

                </div>
                <form className="space-y-6" onSubmit={submitReset}>
                    <div>
                        <label className="label-standard">Email address</label>
                        <input type="email" className="textinput-standard" placeholder="john@example.com" ref={emailRef}></input>
                    </div>
                    <Button type="submit" variant="filled" className="w-full">Send reset link</Button>
                </form>
            </>
            }
        </>
    )
}

function CheckInbox() {

    const fade = useFade();

    return(
        <>
            <div className="mb-4 space-y-2">
                <h1 className="text-2xl font-bold">Reset link sent</h1>
                <p className="text-sm text-neutral-400">Check the mailbox of the email you provided, if an account exists with the given email the reset link will be sent.</p>
                <p className="text-sm text-neutral-400">If you cannot find the email, make sure to check your spam folder!</p>
            </div>
            <Button variant="filled" className="w-full" onClick={() => fade('/account/login')}>Back to login</Button>
        </>
    )
}