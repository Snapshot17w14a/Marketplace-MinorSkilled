export type Message = {
    id?: number,
    conversationId: number,
    content: string,
    sentAt?: string,
    senderId: string
}