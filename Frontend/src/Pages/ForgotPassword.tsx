import { useRef, type FormEvent } from "react";
import Button from "../Components/Button";
import { useFade } from "./AccountPage";
import { postAnonymous } from "../BackendClient";
import { useNotify } from "../Components/NotificationProvider";

export default function ForgotPassword() {

    const fade = useFade();
    const nofity = useNotify();

    const emailRef = useRef<HTMLInputElement>(null);

    const submitReset = async (e: FormEvent) => {
        e.preventDefault();

        if (!emailRef.current) return;

        const response = await postAnonymous('User/RequestResetToken', { email: emailRef.current.value}, errorHandler);

        console.log(response);
    }

    const errorHandler = (e: unknown) => {
        nofity({
            type: 'error',
            header: "Something went wrong!",
            message: `${e}`
        });
    }

    return(
        <div className="flex content-start flex-wrap w-full h-full text-center py-8 px-12">
            <Button className="mb-6 w-16 text-2xl font-bold" onClick={() => {fade(); setTimeout(() => history.back(), 500)}}>🡐</Button>
            <h1 className="text-4xl font-bold mb-6 basis-full">Reset password</h1>
            <p className="mb-6">Enter the email address associated with your account, and we will send you a link to reset your password!</p>
            <form className="flex flex-wrap basis-full min-w-0 justify-center" onSubmit={submitReset}>
                <input type="email" className="textinput-standard mb-6" placeholder="Email" ref={emailRef}></input>
                <Button type="submit" variant="filled" className="px-2 py-2">Send reset link</Button>
            </form>
        </div>
    )
}