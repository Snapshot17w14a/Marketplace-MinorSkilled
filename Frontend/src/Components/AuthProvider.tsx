import { createContext, useContext, useEffect, useRef, useState, type JSX } from "react";
import { type UserData } from "../types/userData";
import { jwtDecode } from "jwt-decode";
import { getAnonymous, getAuthorized, postAnonymous, setGlobalAuthToken } from "../BackendClient";
import { ParseToken as rftDecode } from "../types/refreshToken";
import { Event } from "../classes/Event";
import { fetchSavedListings } from "../SavedListings";

interface AuthContextType {
    authToken: string | null,
    activeUser: UserData | null,
    isLoggedIn: boolean,
    requestAuthToken: (loginDetails: LoginRequest, allowThrowing: boolean) => Promise<boolean>,
    onLogin: Event<UserData>,
    onLogout: Event<{}>,
    logOut: () => Promise<void>,
    request2FASecret: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children } : { children: JSX.Element }) {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const onLogin: Event<UserData> = new Event<UserData>();
    const onLogout: Event<{}> = new Event<{}>();

    const hasInitialFetched = useRef<boolean>(false);

    useEffect(() => {

        if(hasInitialFetched.current)
            return;

        validateLogin();
        hasInitialFetched.current = true;

    }, [])

    const request2FASecret = async () => {
        const data = await getAuthorized<{key: string}>('users/enable2fa');
        return data.key;
    }

    const validateLogin = async () => {
        const initialAccess = await isAccessValid();
        if (initialAccess) return true;

        const refreshAccess = await requestLoginRefresh();
        if (refreshAccess) return true;

        return false;
    }

    const isAccessValid = async () => {
        const accessCookie = await cookieStore.get('access');
        if (!accessCookie) return false;

        const authToken = accessCookie.value!;
        const jwt = jwtDecode(authToken);

        const expSeconds = jwt.exp! * 1000;
        const isValid = expSeconds > Date.now();

        if (isValid){
            const userDataCookie = await cookieStore.get('user');

            const userData = JSON.parse(userDataCookie!.value!);

            setIsLoggedIn(true);
            setUserData(userData);
            setAuthToken(authToken);

            setGlobalAuthToken(authToken);

            fetchSavedListings(userData);
        }

        return isValid;
    }

    const requestAuthToken = async (loginDetails: LoginRequest, allowThrowing: boolean = false) => {
        try {
            const data = await postAnonymous<LoginResult>('users/Login', loginDetails);
            await processLoginResult(data);
            return true;
        }
        catch(e) {
            if (allowThrowing) throw e;
            
            return false;
        }
    }

    const requestLoginRefresh = async () => {
        const refreshCookie = await cookieStore.get('refresh');
        if(!refreshCookie) return false;

        try {
            const data = await postAnonymous<LoginResult>('users/RefreshLogin', { "token": refreshCookie.value! });
            await processLoginResult(data);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    const processLoginResult = async (data: LoginResult) => {
        const jwt = jwtDecode(data.accessToken);
        const rft = rftDecode(data.refreshToken);

        var response = await getAnonymous<{ role: string }>(`users/GetUserRole/${jwt.sub!}`);
        setUserRole(response.role);
        data.userData.role = userRole ?? 'Member';
        
        await cookieStore.set({
            name: "access",
            value: data.accessToken,
            expires: jwt.exp! * 1000,
            path: '/',
        }); 

        await cookieStore.set({
            name: "refresh",
            value: data.refreshToken,
            expires: rft.expiration * 1000,
            path: '/',
        });

        await cookieStore.set({
            name: "user",
            value: JSON.stringify(data.userData),
            path: '/'
        });

        setIsLoggedIn(true);
        setUserData(data.userData);
        setAuthToken(data.accessToken);

        setGlobalAuthToken(data.accessToken);
        fetchSavedListings(data.userData);

        onLogin.invoke(data.userData);
    }

    const logOut = async () => {
        await cookieStore.delete('access');
        await cookieStore.delete('refresh');
        await cookieStore.delete('user');

        setIsLoggedIn(false);
        setUserData(null);
        setAuthToken(null);
        setUserRole(null);

        onLogout.invoke({});
    }

    return(
        <AuthContext.Provider value={{
            authToken: authToken,
            activeUser: userData,
            isLoggedIn: isLoggedIn,
            requestAuthToken: requestAuthToken,
            onLogin: onLogin,
            onLogout: onLogout,
            logOut: logOut,
            request2FASecret: request2FASecret
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}

type LoginResult = {
    accessToken: string,
    refreshToken: string,
    userData: UserData,
}

export type LoginRequest = {
    email: string,
    password: string,
    totp?: string
}
