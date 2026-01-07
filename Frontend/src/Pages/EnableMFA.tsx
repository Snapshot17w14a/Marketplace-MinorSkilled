import Button from "../Components/Button";
import { useFade } from "./AccountPage";
import { useState } from "react";
import { getActiveUser, request2FASecret } from "../Auth";
import QRCode from "react-qr-code";

export default function EnableMFA() {

    const [startEnable, setStartEnable] = useState<boolean>(false);

    const fade = useFade();

    const handleEnable = () => {
        fade();
        setTimeout(() => {
            setStartEnable(true);
        }, 500);
    }

    return(
        <div className="">
            {startEnable ?
            <EnableProcess /> :
            <Prompt handleEnable={handleEnable}/>
            }
            
        </div>
    )
}

function Prompt({ handleEnable } : { handleEnable: () => void }) {

    const fade = useFade();

    return(
        <>
            <div className="mb-6">
                <h2 className="font-bold text-2xl">Enable 2FA?</h2>
                <p className="text-sm text-neutral-400 text-pretty">Make your account more secure by turing on 2 factor authentication.</p>
                <p className="text-sm text-neutral-400">If turned on you will be prompted to enter a 6-digit code on each login, which can be found in the Google Authenticator app.</p>
            </div>
            
            <div>
                <h2 className="font-bold text-xl">How to enable 2FA:</h2>
                <ol className="py-2 mb-4 list-decimal list-inside space-y-2">
                    <li className="text-sm text-neutral-400">Click enable 2FA</li>
                    <li className="text-sm text-neutral-400">Scan the QR code using Google Authenticator, or enter the key manually</li>
                    <li className="text-sm text-neutral-400">Validate the code works</li>
                </ol>
            </div>
            <div className="flex w-full justify-around">
                <Button className="basis-2/3" variant="filled" onClick={handleEnable}>Enable 2FA</Button>
                <Button className="basis-1/4" onClick={() => fade('/')}>No, thanks</Button>
            </div>
        </>
    )
}

function EnableProcess() {

    const fade = useFade();
    const [secret, setSecret] = useState<string>('');

    const handleRequest = async () => {

        const requestedSecret = await request2FASecret();

        fade();
        setTimeout(() => {
            setSecret(requestedSecret);
        }, 500)
    }

    return(
        <>
        {secret !== '' ? <DisplayQR secret={secret}/> :
            <>
                <div className="mb-6 space-y-2">
                    <h2 className="font-bold text-2xl">Set up 2FA</h2>
                    <p className="text-sm text-neutral-400">To enable 2FA you need request a secret, this is generated using your: </p>
                    <ol className="list-disc list-inside">
                        <li className="text-sm text-neutral-400">Personal identifier</li>
                        <li className="text-sm text-neutral-400">Email address</li>
                        <li className="text-sm text-neutral-400">Encrypted password</li>
                    </ol>
                    <p className="text-sm text-neutral-400">This will be used by the Google Authenticator app to generate a rolling code and secure your account!</p>
                </div>
                
                <Button variant="filled" className="px-4 py-2" onClick={handleRequest}>Request secret</Button>
            </>
        }
        </>
    )
}

function DisplayQR({ secret } : { secret: string }) {

    const fade = useFade();

    const [showSecret, setShowSecret] = useState<boolean>(false);
    const [progress] = useState<boolean>(false);

    return(
        <>
            {progress ? <TestCode /> : 
            <>
                <div className="mb-6 space-y-2">
                    <h1 className="font-bold text-2xl">Set up 2FA</h1>
                    <p className="text-sm text-neutral-400">Now you can scan the QR code using Google Authenticator.</p>
                    <p className="text-sm text-neutral-400">Simply open the app. Click the + on the bottom right, and hit 'Scan a QR code'</p>
                </div>
                
                <QRCode className="my-4 mx-auto ring-2 ring-(--light-dark) rounded-lg" fgColor="#1c1c1d" value={`otpauth://totp/Kevin's%20Marketplace:${getActiveUser()?.email}?secret=${secret}&issuer=Kevin's%20Marketplace`}></QRCode>

                <div className="mb-6 space-y-2">
                    <p className="text-sm text-neutral-400">If the QR code fails to scan, you can also enter the secret key manually in the key field.</p>
                    {showSecret ? <p className="text-sm text-neutral-400">{secret}</p> : <div className="bg-(--mid-dark) px-2 py-1 rounded-lg select-none text-sm" onClick={() => setShowSecret(true)}>Click to reveal secret</div>}
                    <p className="text-sm text-neutral-400">Do not share the code with anybody! After this screen the key will not be retrivable!</p>
                </div>
                
                <Button className="w-full" variant="filled" onClick={() => fade('/')}>Finish</Button>
            </>
            }
        </>
    )
}

function TestCode() {
    return(
        <>
        </>
    )
}