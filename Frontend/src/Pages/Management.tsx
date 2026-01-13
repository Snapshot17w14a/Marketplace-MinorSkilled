import { Heart, LogOut, MessageSquare, Pencil, User } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MenuButton } from "../Components/MenuButton";
import { type ListingDescriptor } from "../types/listingDescriptor";
import { getSavedListingDescriptors } from "../SavedListings";
import ProductCard from "../Components/ProductCard";
import { useNotify } from "../Components/NotificationProvider";
import defaultPfp from '../assets/DefaultProfile.svg';
import Button from "../Components/Button";
import PillInput from "../Components/PillInput";
import { UploadFileToServer } from "../FileHandler";
import { getAnonymous, patchAuthorized } from "../BackendClient";
import endpointsConfig from "../Configs/endpoints.config";
import { type UserData } from "../types/userData";
import { useSignalR } from "../Components/SignalRProvider";
import { useAuth } from "../Components/AuthProvider";

export default function Management() {

    const {page} = useParams();
    const auth = useAuth();

    const subPages: { [id: string]: JSX.Element } = {
        "profile": <Profile />,
        "saves": <Saves />,
        "chats": <Chats />
    }

    const [renderedSubpage, setRenderedSubpage] = useState<JSX.Element>();

    const fieldsetRef = useRef<HTMLFieldSetElement | null>(null);

    useEffect(() => {
        if (!page)
            return;

        setRenderedSubpage(subPages[page]);
        
        if(!fieldsetRef.current)
            return;

        const arr = Array.from(fieldsetRef.current.children);
        const buttonLabel = arr.find(element => element.id == page) as HTMLLabelElement 

        const inputElement = buttonLabel.lastElementChild as HTMLInputElement;
        inputElement.checked = true;

    }, [page])

    return(
        <div className="min-h-screen pt-16 flex flex-col lg:flex-row gap-8">
            <aside className="flex flex-col justify-between w-full lg:w-64 p-4">
                <div className="space-y-8 w-full">
                    <p className="text-2xl font-bold">Management Menu</p>
                    <fieldset ref={fieldsetRef} className="space-y-2">
                        <PageButton icon={<User/>}  title="Profile" radioName="management-page" onClick={() => setRenderedSubpage(subPages["profile"])}/>
                        <PageButton icon={<Heart/>} title="Saves"   radioName="management-page" onClick={() => setRenderedSubpage(subPages["saves"])}/>
                        <PageButton icon={<MessageSquare/>} title="Chats"   radioName="management-page" onClick={() => setRenderedSubpage(subPages["chats"])}/>
                    </fieldset>
                </div>
                <div>
                    <MenuButton className="hover:bg-(--mid-dark) transition-colors" icon={<LogOut/>} title="Log Out" onClick={() => auth?.logOut()} />
                </div>
            </aside>

            <main className="flex-1 p-4">
                {renderedSubpage && renderedSubpage}
            </main>
        </div>
    )
}

function PageButton({ icon, title, radioName, onClick } : { icon: JSX.Element, title: string, radioName: string, onClick?: () => void}) {
    return(
        <label id={title.toLocaleLowerCase()} className="flex items-center justify-between select-none has-checked:bg-(--light-dark) hover:bg-(--mid-dark) p-2 rounded-lg transition-all active:scale-[0.98] has-checked:border-l-4 border-rose-500" onClick={onClick}>
            <div className="flex gap-2">
                {icon}
                <p>{title}</p>
            </div>
            <input className="hidden" type="radio" name={radioName}/>
        </label>
    )
}

function Profile() {

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

        getAnonymous<UserData>(`users/get/${auth.activeUser.guid}`)
            .then(result => {
                console.log(result)
                setUser(result);
            })
            .catch(reason => notify({
                header: 'Something went wrong',
                message: 'Could not fetch user data from server. ' + reason,
                type: 'error'
            }))
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
            message: 'Your account details were updated!',
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

function Saves() {

    const [savedListings, setSavedListings] = useState<ListingDescriptor[] | null>(null);

    const notify = useNotify();

    useEffect(() => {
        getSavedListingDescriptors()
            .then(data => {
                console.log(data);
                console.log('then');
                setSavedListings(data)
                console.log('setdatacalled')
            })
            .catch(reason => notify({
                header: 'Failed to fetch saved listing data',
                message: `${reason}`,
                type: 'error'
            }));
    }, [])

    return(
        <>
            <h2 className="text-4xl font-bold mb-8">Saved listings</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-fit">
                {savedListings &&
                    savedListings.map((descriptor, index) => {
                        console.log('mapping listing: ' + descriptor);
                        return <ProductCard descriptor={descriptor} key={index} />
                    })
                }
            </div>
        </>
    )
}

function Chats() {

    const chatContext = useSignalR();

    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        chatContext?.connection?.on('SendMessage', (args) => {
            console.log(args);
            setMessages(prev => [...prev, args]);
        })
    }, [chatContext.connection])

    return(
        <>
            {messages.length > 0 &&
                messages.map((message, index) => {
                    return <p key={index}>{message}</p>
                })
            }
        </>
    )
}