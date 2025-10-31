import { useNavigate } from 'react-router-dom'
import { GetCurrentActiveUser, IsLoggedIn, LogOutUser } from '../Auth';
import Logo from '../assets/Subtract.svg'
import Button from './Button'
import { useEffect, useState } from 'react';

export default function TopNavigation({ className = ''}) {

    useEffect(() => {
        setIsLoggedIn(IsLoggedIn());
    }, []);

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const handleLogOut = () => {
        LogOutUser();
        setIsLoggedIn(false);
    };

    return(
        <nav className={'w-screen h-16 bg-[#262626] border-b-2 border-[#484747] p-2 flex justify-between fixed top-0 drop-shadow-xl drop-shadow-rose-500/50' + className}>
            <div className='flex h-full justify-around items-center'>
                <button type='button' className='h-full w-12 cursor-pointer' onClick={() => navigate('/')}>
                    <img src={Logo} className='h-full object-contain'></img>
                </button>
                <p className='mx-2 text-3xl font-bold text-rose-500 invisible w-0 sm:w-auto sm:visible'>Kev's marketplace</p>
            </div>
            {
                isLoggedIn ? 
                <div className='flex justify-around items-center'> 
                    <p className='font-bold text-lg w-min sm:w-auto'>Logged in as {GetCurrentActiveUser()?.username}</p>
                    <Button variant='filled' className='px-4 py-2.5 ml-4' onClick={handleLogOut}>Log out</Button>
                </div> 
                :
                <div className='flex justify-around items-center'>
                    <Button className='px-4 py-2.5 mx-2' variant='filled' onClick={() => navigate('/account/register')}>Register</Button>
                    <Button className='px-4 py-2 mx-2' onClick={() => navigate('/account/login')}>Log in</Button>
                </div>
            }
        </nav>
    )
}