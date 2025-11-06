import { useNavigate, useParams } from "react-router-dom";
import Button from "../Components/Button";
import { useFade } from "./AccountPage";
import { useRef, useState, type FormEvent } from "react";
import { postAnonymous } from "../BackendClient";
import { useNotify } from "../Components/NotificationProvider";
import { FetchError } from "../classes/FetchError";

export default function ChangePassword() {

    const {resetToken} = useParams();

    const fade = useFade();
    const notify = useNotify();
    const navigate = useNavigate();

    const [incorrectText, setIncorrectText] = useState<boolean>(false);
    const passwordRef = useRef<HTMLInputElement>(null);
    const verifyRef = useRef<HTMLInputElement>(null);

    const resetPassword = async (e: FormEvent) => {
        e.preventDefault();

        if (!passwordRef.current || !verifyRef.current) return;

        if (passwordRef.current.value !== verifyRef.current.value){
            setIncorrectText(true);
            return;
        }

        const data = {
            token: resetToken,
            password: passwordRef.current.value
        }

        try {
            await postAnonymous<string>('User/ResetPassword', data);
        }
        catch (e) {
            if (e instanceof FetchError){
                switch(e.code) {
                    case 404:
                        notify({
                            header: "User or Token not found!",
                            message: `${e.error}`,
                            type: 'error'
                        });
                        break;
                    case 403:
                        notify({
                            header: "Invalid token!",
                            message: 'The token used was invalid, or expired. Please request another token, and try again!',
                            type: 'error'
                        });
                        break;
            }
            } else {
                // fallback for SyntaxError / TypeError / network errors
                notify({
                    header: "Error resetting password",
                    message: (e as Error).message ?? "An unexpected error occurred.",
                    type: 'error'
                });
            }

            return;
        }

        notify({
            header: "Password was reset!",
            message: `Use your email address and new password to log in!`,
            type: 'info'
        });

        fade();
        setTimeout(() => {
            navigate("/account/login");
        }, 500);
    };

    return(
        <div className="flex content-start flex-wrap w-full h-full text-center py-8 px-12">
            <Button className="mb-6 w-16 text-2xl font-bold" onClick={() => {fade(); setTimeout(() => history.back(), 500)}}>🡐</Button>
            <h1 className="text-4xl font-bold mb-6 basis-full">Enter new password</h1>
            <form className="flex flex-wrap basis-full min-w-0 justify-center" onSubmit={resetPassword}>
                <input type="text" className="textinput-standard mb-6" placeholder="New password" required min={8} ref={passwordRef}></input>
                <input type="text" className="textinput-standard mb-6" placeholder="Repeat password" required min={8} ref={verifyRef}></input>
                {incorrectText && <p className="basis-full mb-6">Password fields do not match!</p>}
                <Button type="submit" variant="filled" className="px-2 py-2">Change password</Button>
            </form>
        </div>
    )
}