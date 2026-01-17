// import { useEffect, useRef, useState } from 'react';
// import * as signalR from '@microsoft/signalr';
// import endpointsConfig from './Configs/endpoints.config';

// export const useChat = () => {

//     const [messages, setMessages] = useState<any[]>([]);
//     const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
//     const isConfigured = useRef<boolean>(false);

//     useEffect(() => {
        
//         if (isConfigured.current)
//             return;

//         const newConnection = new signalR.HubConnectionBuilder()
//             .withUrl(endpointsConfig.BackendBaseUrl + 'chatHub', {
//                 accessTokenFactory: getJWT
//             })
//             .withAutomaticReconnect()
//             .build();

//         setConnection(newConnection);
//         isConfigured.current = true;
//     }, []);

//     useEffect(() => {
//         if (connection) {
//             connection.start()
//                 .then(() => console.log('SignalR Connected!'))
//                 .catch(err => console.error('Connection failed: ', err));

//             connection.on('ReceiveMessage', (newMessage) => {
//                 setMessages(prev => [...prev, newMessage]);
//             });

//             return () => {
//                 connection.stop();
//             };
//         }
//     }, [connection]);

//     return { messages, connection };
// };