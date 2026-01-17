import { useParams } from "react-router-dom";
import Button from "../../Components/Button";
import { useFade } from "./AccountPage";
import { useRef, useState, type FormEvent } from "react";
import { postAnonymous } from "../../BackendClient";
import { useNotify } from "../../Components/NotificationProvider";
import { FetchError } from "../../classes/FetchError";

export default function ChangePassword() {

    const {resetToken} = useParams();

    const fade = useFade();
    const notify = useNotify();

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
            await postAnonymous<string>('users/ResetPassword', data);
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
            type: 'success'
        });

        fade("/account/login");
    };

    return(
        <>
            <h2 className="text-2xl font-bold mb-6">Change password</h2>

            <form className="space-y-6" onSubmit={resetPassword}>

                <div>
                    <label className="label-standard">New password</label>
                    <input type="password" className="textinput-standard" placeholder="••••••••" required min={8} ref={passwordRef}></input>
                </div>

                <div>
                    <label className="label-standard">Repeat password</label>
                    <input type="password" className="textinput-standard" placeholder="••••••••" required min={8} ref={verifyRef}></input>
                </div>

                {incorrectText && <p className="text-sm">Password fields do not match!</p>}

                <Button type="submit" variant="filled" className="w-full">Change password</Button>
            </form>
        </>
    )
}