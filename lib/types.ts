export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: Date
  status: "sent" | "delivered" | "read"
}

export interface Conversation {
  id: string
  user: User
  lastMessage: Message
  unread: number
}

