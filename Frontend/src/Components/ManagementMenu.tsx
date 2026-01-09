import { Heart, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePopup, type PopupContent } from "./PopupProvider";
import { getActiveUser, logOut } from "../Auth";
import { MenuButton } from "./MenuButton";

export default function ManagementMenu({ closeMenu, opacity } : { closeMenu: () => void, opacity: number }) {

    const navigate = useNavigate();
    const popup = usePopup();

    const user = getActiveUser();

    const handleNavigation = (link: string) => {
        closeMenu();
        navigate(link);
    }
    
    const handleLogOut = () => {
        closeMenu();
        logOut();    
    }

    const logoutPopupContent: PopupContent = {
        title: "Are you sure",
        message: "You are about to log out. If you do this, you must enter your credentials next time to access content on the website.",
        onAccept: handleLogOut
    };

    return(
        <div 
            className="absolute border-2 border-(--light-dark) w-64 z-20 top-13 -right-0.5 rounded-lg bg-(--mid-dark) overflow-clip shadow-xl p-2 transition-all space-y-2"
            style={{ opacity: opacity, transform: `translateX(${(1 - opacity) * 100}px)` }}
        >
            <p className="px-2 pt-1 text-xl font-bold">Hello, {user?.username}</p>

            <MenuSeparator />

            <div>
                <MenuButton className="hover:bg-(--dark)" icon={<User/>} title='Profile' onClick={() => handleNavigation('management/profile')}/>
                <MenuButton className="hover:bg-(--dark)" icon={<Heart/>} title='Saves' onClick={() => handleNavigation('management/saves')}/>
            </div>

            <MenuSeparator />

            <MenuButton className="hover:bg-(--dark)" icon={<LogOut/>} title='Log Out' onClick={() => popup(logoutPopupContent)}/>
        </div>
    )
}

function MenuSeparator() {
    return(<div className="w-full border-[1px] border-(--light-dark) mx-auto rounded-lg"></div>)
}