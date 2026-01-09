import { useRef, type FormEvent, type RefObject } from "react";
import Button from "../../Components/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { requestJWToken } from "../../Auth";
import { FetchError } from "../../classes/FetchError";
import { useNotify } from "../../Components/NotificationProvider";
import responseCodes from "../../types/responseCodes";

export default function EnterMFA() {

    const { email, password } = useLocation().state;
    const notify = useNotify();
    const navigate = useNavigate();

    const validKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    const inputRefs: RefObject<HTMLInputElement | null>[] = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
        e.preventDefault();

        // Check for specific control keys
        switch (e.key){
            case 'Enter':
                handleSubmit();
                return;
            case 'Backspace':
                const current = inputRefs[i];
                if (!current.current)
                    return;

                if (i == 0 || current.current.value !== ''){
                    current.current.value = ''
                    return;
                }
                else {
                    const prev = inputRefs[i - 1];
                    if (!prev.current)
                        return;

                    prev.current.value = '';
                    prev.current.focus();
                    return;
                }
            case 'ArrowLeft':
                if (i == 0)
                    return;

                inputRefs[i - 1].current?.focus();
                return;
            case 'ArrowRight':
                if (i == inputRefs.length - 1)
                    return;

                inputRefs[i + 1].current?.focus();
                return;
        }

        // Filter keys to only inlcude numerics
        if (!validKeys.find(key => key === e.key))
            return;

        // Null check current input and set value to the pressed key value
        const currentInput = inputRefs[i];
        if (!currentInput.current)
            return
        currentInput.current.value = e.key;

        // If this was the last input, don't advance
        if (i === inputRefs.length - 1)
            return;

        // Focus the next input
        const nextInput = inputRefs[i + 1]
        if (!nextInput.current)
            return;
        nextInput.current.focus();
    }

    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault();

        var totp = '';

        inputRefs.forEach(input => {
            if (!input.current)
                return;

            totp += input.current.value;
        })

        if (totp.length < 6)
            return;

        try {
            await requestJWToken({
                email: email,
                password: password,
                totp: totp
            }, true)
            navigate('/');
        }
        catch (e) {
            if (e instanceof(FetchError)){
                switch(e.code){
                    case responseCodes.Forbidden:
                        notify({
                            header: 'MFA code is incorrect',
                            message: 'The provided multi factor authentication code was incorrect, try again',
                            type: 'error'
                        })
                        break;
                    
                }
            }
            else {

            }
        }

        console.log(totp);
    }

    return(
        <div className="">
            
            <div className="space-y-2 text-center">
                <h2 className="text-2xl">Enter authentication code</h2>
                <p className="text-sm text-neutral-300">Open your Google Authenticator app, and enter the 6-digit number under your marketplace account</p>
            </div>

            <form className="flex flex-col w-full items-center" onSubmit={handleSubmit}>
                <div className="flex gap-2 my-8 justify-around">
                    <input ref={inputRefs[0]} type="text" className="authcode" inputMode="numeric" pattern="[0-9]*" size={1} onKeyDown={e => handleKeyUp(e, 0)} required autoFocus></input>
                    <input ref={inputRefs[1]} type="text" className="authcode" inputMode="numeric" pattern="[0-9]*" size={1} onKeyDown={e => handleKeyUp(e, 1)} required></input>
                    <input ref={inputRefs[2]} type="text" className="authcode" inputMode="numeric" pattern="[0-9]*" size={1} onKeyDown={e => handleKeyUp(e, 2)} required></input>
                    <input ref={inputRefs[3]} type="text" className="authcode" inputMode="numeric" pattern="[0-9]*" size={1} onKeyDown={e => handleKeyUp(e, 3)} required></input>
                    <input ref={inputRefs[4]} type="text" className="authcode" inputMode="numeric" pattern="[0-9]*" size={1} onKeyDown={e => handleKeyUp(e, 4)} required></input>
                    <input ref={inputRefs[5]} type="text" className="authcode" inputMode="numeric" pattern="[0-9]*" size={1} onKeyDown={e => handleKeyUp(e, 5)} required></input>
                </div>
                <Button className="w-24" type="submit" variant="filled">Enter</Button>
            </form>
        </div>
    )
}