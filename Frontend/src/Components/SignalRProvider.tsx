import * as signalR from '@microsoft/signalr';
import { createContext, useContext, useEffect, useRef, useState, type JSX } from 'react';
import endpointsConfig from '../Configs/endpoints.config';
import { useAuth } from './AuthProvider';

interface SignalRContextType {
    connection: signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export default function SignalRProvider({ children } : { children: JSX.Element }) {

    const auth = useAuth();

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const isConfigured = useRef<boolean>(false);

    useEffect(() => {

        console.log('use effect start');

        if (isConfigured.current || !auth)
            return;

        if (!auth.authToken){
            connection?.stop();
            setConnection(null);
            return;
        }

        console.log('passed config and auth check');
        console.log(auth.authToken);

        isConfigured.current = true;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(endpointsConfig.BackendBaseUrl + 'chatHub', {
                accessTokenFactory: () => auth.authToken!
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        setConnection(newConnection);

        return () => {
            isConfigured.current = false;
        }

    }, [auth?.authToken]);

    useEffect(() => {

        if (!connection)
            return;

        connection.start()
            .then(() => {
                console.log("SignalR Connected Globally");
            })
            .catch(err => console.error("SignalR Connection Failed: ", err));

        return () => {
            connection.stop();
            setConnection(null);
        };
    }, [connection])

    return(
        <SignalRContext.Provider value={{connection}}>
            {children}
        </SignalRContext.Provider>
    )
}

export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error("useSignalR must be used within a SignalRProvider");
    }
    return context;
};