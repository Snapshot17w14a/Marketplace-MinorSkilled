import { Heart, LogOut, MessageSquare, User } from "lucide-react";
import { useEffect, useRef, useState, type JSX } from "react";
import { useParams } from "react-router-dom";
import { MenuButton } from "../Components/MenuButton";
import { useAuth } from "../Components/AuthProvider";
import { Chats } from "./Chats";
import { PageButton } from "./PageButton";
import Profile from "./Profile";
import Saves from "./Saves";

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
        <div className="min-h-screen pt-16 flex flex-col lg:flex-row lg:gap-8">
            <aside className="flex flex-col justify-between w-full lg:w-64 p-4 gap-4 lg:gap-0">
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