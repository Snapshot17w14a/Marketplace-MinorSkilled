import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react';
import { Contact, Heart, LogIn, Menu } from 'lucide-react';
import PillButton from './PillButton';
import ManagementMenu from './ManagementMenu';
import { useAuth } from './AuthProvider';

export default function TopNavigation({ className = ''}) {

    const navigate = useNavigate();
    const auth = useAuth();

    const [loggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showManagementMenu, setShowManagementMenu] = useState<boolean>(false);
    const [managementOpacity, setManagementOpacity] = useState<number>(0);

    const fadeHandle = useRef<number | undefined>(undefined);
    
    const managementElement = <ManagementMenu closeMenu={() => setShowManagementMenu(false)} opacity={managementOpacity}/>;

    useEffect(() => {
        if (!auth)
            return;

        setIsLoggedIn(auth.isLoggedIn);
    }, [auth?.isLoggedIn])

    const toggleManagementMenu = () => {
        if (fadeHandle.current != undefined)
        {
            window.clearTimeout(fadeHandle.current);
            fadeHandle.current = undefined;
            setShowManagementMenu(true);
            setManagementOpacity(1);
            return;
        }

        if (showManagementMenu){
            setManagementOpacity(0);
            fadeHandle.current = window.setTimeout(() => {
                setShowManagementMenu(false);
                fadeHandle.current = undefined;
            }, 500);
        } else {
            setShowManagementMenu(true);
            window.setTimeout(() => {
                setManagementOpacity(1);
            }, 10)
        }
    }

    return(
        <>
            <nav className={'w-screen bg-(--dark) border-b border-(--light-dark) px-3 py-3 flex justify-between fixed top-0 z-10 ' + className}>

                <p className='text-xl font-bold text-rose-500 my-auto cursor-pointer' onClick={() => navigate('/')}>Kev's marketplace</p>
                    
                <div className='flex gap-2 select-none relative'>
                    
                    {loggedIn ? 
                        <>
                            <PillButton icon={<Heart/>} text='Saves' className='h-8' onClick={() => navigate('management/saves')}/>
                            <PillButton icon={<Menu/>} text='Menu' className='h-8' onClick={toggleManagementMenu}/>
                        </>
                        :
                        <>
                            <PillButton icon={<Contact/>} text='Register' className='h-8' onClick={() => navigate('account/register')}/>
                            <PillButton icon={<LogIn/>} text='Log In' className='h-8' onClick={() => navigate('account/login')}/>
                        </>
                    }

                    {showManagementMenu && managementElement}

                </div>

            </nav>
        </>
    )
}