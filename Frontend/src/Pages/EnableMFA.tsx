import { useNavigate } from "react-router-dom";
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
        <div className="flex content-start flex-wrap w-full h-full text-center py-8 px-12 justify-center">
            {startEnable ?
            <EnableProcess /> :
            <Prompt handleEnable={handleEnable}/>
            }
            
        </div>
    )
}

function Prompt({ handleEnable } : { handleEnable: () => void }) {

    const fade = useFade();
    const navigate = useNavigate();

    return(
        <>
            <h1 className="font-bold text-4xl mb-4">Enable 2FA?</h1>
            <div className="mb-4">
                <p className="text-pretty">Make your account more secure by turing on 2 factor authentication.</p>
                <p>If turned on you will be prompted to enter a 6-digit code on each login, which can be found in the Google Authenticator app.</p>
            </div>
            <p className="font-bold text-2xl">How to enable 2FA:</p>
            <ol className="py-2 mb-4 list-decimal list-inside">
                <li className="mb-2">Click enable 2FA</li>
                <li className="mb-2">Scan the QR code using Google Authenticator, or enter the key manually</li>
                <li className="">Validate the code works</li>
            </ol>
            <div className="flex w-full justify-around">
                <Button className="px-4 py-2" variant="filled" onClick={handleEnable}>Enable 2FA</Button>
                <Button className="basis-2/3" onClick={() => {fade(); setTimeout(() => navigate("/"), 500)}}>Continue without 2FA</Button>
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
                <h1 className="font-bold text-4xl mb-4">Set up 2FA</h1>
                <p className="mb-2">To enable 2FA you need request a secret, this is generated using your: </p>
                <ol className="list-disc list-inside mb-2">
                    <li>Personal identifier</li>
                    <li>Email address</li>
                    <li>Encrypted password</li>
                </ol>
                <p className="mb-4">This will be used by the Google Authenticator app to generate a rolling code and secure your account!</p>
                <Button variant="filled" className="px-4 py-2" onClick={handleRequest}>Request secret</Button>
            </>
        }
        </>
    )
}

function DisplayQR({ secret } : { secret: string }) {

    const navigate = useNavigate();

    const [showSecret, setShowSecret] = useState<boolean>(false);
    const [progress] = useState<boolean>(false);

    return(
        <>
            {progress ? <TestCode /> : 
            <>
                <h1 className="font-bold text-4xl mb-4">Set up 2FA</h1>
                <p>Now you can scan the QR code using Google Authenticator.</p>
                <p>Simply open the app. Click the + on the bottom right, and hit 'Scan a QR code'</p>
                <QRCode className="my-4 ring-2 ring-(--light-dark) rounded-lg" fgColor="#1c1c1d" value={`otpauth://totp/Kevin's%20Marketplace:${getActiveUser()?.email}?secret=${secret}&issuer=Kevin's%20Marketplace`}></QRCode>
                <p>If the QR code fails to scan, you can also enter the secret key manually in the key field.</p>
                {showSecret ? <p className="py-1">{secret}</p> : <div className="bg-(--dark) px-2 py-1 rounded-lg select-none" onClick={() => setShowSecret(true)}>Click to reveal secret</div>}
                <p className="mb-4">Do not share the code with anybody! After this screen the key will not be retrivable!</p>
                <Button className="px-4 py-2" variant="filled" onClick={() => navigate('/')}>Finish</Button>
                {/* <Button variant="filled" onClick={() => setProgress(true)}>Test code</Button> */}
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