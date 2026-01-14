import { Pencil } from "lucide-react";
import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { patchAuthorized } from "../BackendClient";
import { useAuth } from "../Components/AuthProvider";
import Button from "../Components/Button";
import { useNotify } from "../Components/NotificationProvider";
import PillInput from "../Components/PillInput";
import endpointsConfig from "../Configs/endpoints.config";
import { UploadFileToServer } from "../FileHandler";
import type { UserData } from "../types/userData";
import defaultPfp from '../assets/DefaultProfile.svg'

export default function Profile() {

    const navigate = useNavigate();
    const notify = useNotify();
    const auth = useAuth();

    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [uploadedProfilePicture, setUploadedProfilePicture] = useState<File | null>(null);

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {

        if (!auth?.activeUser)
            return;

        setUser(auth.activeUser);

    }, [auth?.activeUser])

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {

        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];

        setUploadedProfilePicture(file);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const editedData: any = {};

        // Upload profile picture, if it was edited
        if (uploadedProfilePicture){
            const result = await UploadFileToServer('images/UploadProfilePicture', uploadedProfilePicture);
            editedData.pfpId = result.id;
        }

        if (emailRef.current == null || usernameRef.current == null)
            return;

        editedData.email = emailRef.current.value;
        editedData.username = usernameRef.current.value;

        try{
            await patchAuthorized('users/UpdateUserData', editedData);
        }
        catch (e){
            notify({
                header: "Failed to update user details",
                message: "Something went wrong while trying to update your account details. " + e,
                type: 'error'
            })
        }

        notify({
            header: 'Account details updated successfully!',
            message: 'Your account details were updated, you might need to relog to see changes!',
            type: 'success'
        })
    }

    const profilePictureURL = () => {
        if (uploadedProfilePicture)
            return URL.createObjectURL(uploadedProfilePicture);

        if (user?.profilePictureId)
            return endpointsConfig.BackendStaticUrl + 'uploads/profilePictures/' + user.profilePictureId + '.png';

        return defaultPfp;
    }

    return(
        <>
            <h2 className="text-4xl font-bold mb-8">Welcome back, {user?.username}</h2>
            <p className="text-2xl border-b-2 border-(--light-dark) pb-2">Public profile</p>
            <div className="flex lg:flex-row-reverse flex-col">

                <div className="lg:basis-1/3 py-4 px-4">
                    <p className="text-2xl">Profile picture</p>
                    <div className="mx-auto relative aspect-square rounded-full border-2 border-(--light-dark) size-48">
                        <img className="object-cover h-full aspect-square rounded-full" src={profilePictureURL()}></img>
                        <PillInput 
                            className="absolute -bottom-4 -right-4 bg-(--dark)" 
                            icon={<Pencil/>} 
                            text="Edit" 
                            type="file" 
                            accept="image/*"
                            multiple={false}
                            onChange={onFileChange}/>
                    </div>
                </div>

                <div className="lg:basis-2/3 p-4">
                    <form className="space-y-2 max-w-lg" onSubmit={handleSubmit}>

                        <div className="space-y-1">
                            <label className="label-standard">Username</label>
                            <input className="textinput-standard" defaultValue={user?.username} ref={usernameRef} placeholder="Username"/>
                        </div>

                        <div className="space-y-1">
                            <label className="label-standard">Email address</label>
                            <input className="textinput-standard" defaultValue={user?.email} ref={emailRef} placeholder="Email"></input>
                        </div>

                        <div className="space-y-1">
                            <label className="label-standard">Password - to change your password you will be redirected to a separate page</label>
                            <Button variant="filled" className="block px-4 mt-2" onClick={() => navigate('/account/forgotpassword')}>Change password</Button>
                        </div>

                        <Button variant="filled" className="mt-8 w-1/2" type="submit">Submit changes</Button>

                    </form>
                </div>

            </div>
        </>
    )
}