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
            <div className="flex content-start flex-wrap w-full h-full text-center py-8 px-12">
                <Button className="mb-6 w-16 text-2xl font-bold" onClick={() => {fade(); setTimeout(() => history.back(), 500)}}>🡐</Button>
                <h1 className="text-4xl font-bold mb-6 basis-full">Reset password</h1>
                <p className="mb-6">Enter the email address associated with your account, and we will send you a link to reset your password!</p>
                <form className="flex flex-wrap basis-full min-w-0 justify-center" onSubmit={submitReset}>
                    <input type="email" className="textinput-standard mb-6" placeholder="Email" ref={emailRef}></input>
                    <Button type="submit" variant="filled" className="px-2 py-2">Send reset link</Button>
                </form>
            </div>
            }
        </>
    )
}

function CheckInbox() {

    const fade = useFade();

    return(
        <div className="flex content-start justify-center flex-wrap w-full h-full text-center py-8 px-12">
            <h1 className="text-4xl font-bold mb-6">Reset link sent</h1>
            <p>Check the mailbox of the email you provided, if an account exists with the given email the reset link will be sent.</p>
            <p>If you cannot find the email, make sure to check your spam folder!</p>
            <Button variant="filled" className="px-4 py-2 mt-2" onClick={() => {fade(); setTimeout(() => {history.back();}, 500)}}>Back to login</Button>
        </div>
    )
}