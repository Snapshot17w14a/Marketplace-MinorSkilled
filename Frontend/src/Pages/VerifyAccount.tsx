import { useNavigate, useParams } from "react-router-dom"
import Button from "../Components/Button";
import { getAuthorized } from "../BackendClient";
import { FetchError } from "../classes/FetchError";
import responseCodes from "../types/responseCodes";
import { useNotify } from "../Components/NotificationProvider";
import { useFade } from "./AccountPage";

export default function VerifyAccount() {

    const { verificationCode } = useParams();

    const fade = useFade();
    const navigate = useNavigate();
    const notify = useNotify();

    const handleSubmit = async () => {
        try {
            await getAuthorized(`users/verifyAccount/${verificationCode}`);
        }
        catch (e) {
            if (e instanceof(FetchError)) {
                switch(e.code) {
                    case responseCodes.NotFound:
                        notify({
                            header: 'Not found',
                            message: 'We could not find your account, please try again later.',
                            type: 'error'
                        })
                        return;
                    case responseCodes.Conflict:
                        notify({
                            header: 'Already verified',
                            message: 'Your account is already verified!',
                            type: 'info'
                        })
                        return;
                }
            }
        }

        fade();
        setTimeout(() => {
            navigate('/');
        }, 500);
    }

    return(
        <div className="flex content-start justify-center flex-wrap w-full h-full text-center py-8 px-12">
            <h1 className="font-bold text-4xl basis-full mb-6">Verify account</h1>
            <p className="mb-6">Click the button below to verity your account</p>
            <Button className="px-4 py-2" variant="filled" onClick={handleSubmit}>Verify account</Button>
        </div>
    )
}