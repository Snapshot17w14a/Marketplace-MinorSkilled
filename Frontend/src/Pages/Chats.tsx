import { useState, useEffect, useRef, type FormEvent } from "react";
import { getAuthorized, postAuthorized } from "../BackendClient";
import { useSignalR } from "../Components/SignalRProvider";
import type { Conversation } from "../types/conversation";
import { PageButton } from "./PageButton";
import { MessageCircle, Send } from "lucide-react";
import type { Message } from "../types/message";
import { useAuth } from "../Components/AuthProvider";
import PillButton from "../Components/PillButton";
import type { UserData } from "../types/userData";

export function Chats() {

    const chatContext = useSignalR();
    const auth = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [user, setUser] = useState<UserData | null>(null);

    const conversationId = useRef<number>(0);
    const messageRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {

        if(conversations.length > 0)
            return;

        const fetchConversations = async () => {
            const data = await getAuthorized<Conversation[]>('chat/getconversations');
            setConversations(data);
        };

        fetchConversations();
    }, []);

    useEffect(() => {

        if (!auth?.activeUser)
            return;

        setUser(auth.activeUser);

    }, [auth?.activeUser]);

    const onConversationSelect = async (id: number) => {
        const data = await getAuthorized<Message[]>('chat/GetConversationMessages/' + id);

        conversationId.current = id;
        setMessages(data);
    }

    useEffect(() => {
        chatContext?.connection?.on('SendMessage', handleReceiveMessage);

        return () => {
            chatContext.connection?.off('SendMessage');
        }
    }, [chatContext.connection]);

    const handleReceiveMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    }

    const handleSendMessage = async (e?: FormEvent) => {

        if (e)
            e.preventDefault();

        if (!messageRef.current)
            return;

        await postAuthorized('chat/sendmessage', {
            conversationId: conversationId.current,
            content: messageRef.current.value
        })

        const localMessage: Message = {
            conversationId: conversationId.current,
            content: messageRef.current.value,
            senderId: user?.identifier ?? ""
        }

        setMessages(prev => [...prev, localMessage]);

        messageRef.current.value = '';
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-0">

                <div className="lg:w-64">
                    {conversations.length > 0 &&
                        conversations.map((conversation, index) => {
                            return <PageButton key={index} icon={<MessageCircle/>} title={"Conversation " + conversation.id} radioName="conversation" onClick={() => onConversationSelect(conversation.id)}/>
                        })
                    }
                </div>

                <div className="flex flex-col mx-4 flex-1 gap-4">

                    <h2 className="text-2xl font-bold">Conversation</h2>

                    <div className="flex-1 rounded-lg bg-(--mid-dark) p-4 space-y-2">
                        {messages.length > 0 &&
                            messages.map((message, index) => {

                                const isUsersMessage = message.senderId === user?.identifier;
                                console.log(`${message.senderId} | ${user?.identifier} | ${isUsersMessage}`)
                                
                                return(
                                    <ChatBubble key={index} isLocalUsersMessage={isUsersMessage} content={message.content} />
                                )
                            })
                        }
                    </div>

                    <div className="h-16 flex items-center">
                        <form className="relative w-full" onSubmit={handleSendMessage}>
                            <input className="textinput-standard" placeholder="Message seller" ref={messageRef}/>
                            <PillButton icon={<Send />} text="Send" className="absolute top-2 right-2" onClick={handleSendMessage}/>
                        </form>
                    </div>
                    
                </div>
            </div>

            {/* {messages.length > 0 &&
                messages.map((message, index) => {
                    return <p key={index}>{message}</p>
                })
            } */}
        </>
    );
}

function ChatBubble({ isLocalUsersMessage, content }: { isLocalUsersMessage: boolean, content: string }) {
    return(
        <div className="p-4">
            {isLocalUsersMessage ?
                <div className="w-full text-end">
                    <span className="bg-rose-500/50 p-4 rounded-lg">
                        {content}
                    </span>
                </div> 
                :
                <div className="w-full text-start">
                    <span className="bg-(--light-dark) p-4 rounded-lg">
                        {content}
                    </span>
                </div>
            }
        </div>
    )
}
