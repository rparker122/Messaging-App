"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Send, Plus, Search, MoreVertical, Phone, Video, User, Users, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateRandomMessage, getRandomReply, getRandomUser, formatTime } from "@/lib/utils"
import type { Message, User as UserType, Conversation } from "@/lib/types"

export default function ChatPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [contacts, setContacts] = useState<UserType[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load user data and initialize demo data
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(storedUser) as UserType
    setUser(userData)

    // Generate demo contacts
    const demoContacts = Array.from({ length: 8 }, () => getRandomUser())
    setContacts(demoContacts)

    // Generate demo conversations
    const demoConversations = demoContacts.map((contact) => ({
      id: contact.id,
      user: contact,
      lastMessage: generateRandomMessage(contact.id, userData.id, true),
      unread: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
    }))
    setConversations(demoConversations)

    // Set first conversation as active
    if (demoConversations.length > 0) {
      setActiveConversation(demoConversations[0].id)

      // Generate demo messages for first conversation
      const demoMessages = Array.from({ length: 10 }, (_, i) => {
        const isUser = i % 2 !== 0
        return generateRandomMessage(
          isUser ? userData.id : demoConversations[0].user.id,
          isUser ? demoConversations[0].user.id : userData.id,
          false,
          new Date(Date.now() - (10 - i) * 1000 * 60 * 10),
        )
      })
      setMessages(demoMessages)
    }
  }, [router])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Change active conversation
  const handleConversationChange = (conversationId: string) => {
    setActiveConversation(conversationId)

    // Mark conversation as read
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv)))

    // Generate demo messages for this conversation
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation && user) {
      const demoMessages = Array.from({ length: 8 }, (_, i) => {
        const isUser = i % 2 !== 0
        return generateRandomMessage(
          isUser ? user.id : conversation.user.id,
          isUser ? conversation.user.id : user.id,
          false,
          new Date(Date.now() - (8 - i) * 1000 * 60 * 10),
        )
      })
      setMessages(demoMessages)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !activeConversation) return

    const conversation = conversations.find((c) => c.id === activeConversation)
    if (!conversation) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: conversation.user.id,
      text: newMessage,
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) => (conv.id === activeConversation ? { ...conv, lastMessage: userMessage } : conv)),
    )

    // Simulate typing indicator
    setIsTyping(true)

    // Simulate reply after delay
    const replyDelay = 1000 + Math.random() * 2000
    setTimeout(() => {
      setIsTyping(false)

      // Add reply message
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: conversation.user.id,
        receiverId: user.id,
        text: getRandomReply(),
        timestamp: new Date(),
        status: "delivered",
      }

      setMessages((prev) => [...prev, replyMessage])

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) => (conv.id === activeConversation ? { ...conv, lastMessage: replyMessage } : conv)),
      )
    }, replyDelay)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/login")
  }

  // Get active conversation data
  const activeConversationData = conversations.find((c) => c.id === activeConversation)

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* User header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9 border border-gray-700">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-gray-700 text-purple-300">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-white">{user?.name}</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chats" className="flex-1 flex flex-col">
          <div className="px-4">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger
                value="chats"
                className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-purple-400"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chats
              </TabsTrigger>
              <TabsTrigger
                value="contacts"
                className="flex-1 data-[state=active]:bg-gray-700 data-[state=active]:text-purple-400"
              >
                <Users className="h-4 w-4 mr-2" />
                Contacts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeConversation === conversation.id ? "bg-gray-700" : "hover:bg-gray-800"
                    }`}
                    onClick={() => handleConversationChange(conversation.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                        <AvatarFallback className="bg-gray-700 text-purple-300">
                          {conversation.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white">{conversation.user.name}</div>
                        <div className="text-xs text-gray-400">{formatTime(conversation.lastMessage.timestamp)}</div>
                      </div>
                      <div className="text-sm truncate text-gray-400 max-w-[180px]">
                        {conversation.lastMessage.senderId === user?.id ? "You: " : ""}
                        {conversation.lastMessage.text}
                      </div>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center animate-pulse">
                        {conversation.unread}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      // Find or create conversation with this contact
                      const existingConv = conversations.find((c) => c.user.id === contact.id)
                      if (existingConv) {
                        handleConversationChange(existingConv.id)
                      } else if (user) {
                        // Create new conversation
                        const newConv: Conversation = {
                          id: contact.id,
                          user: contact,
                          lastMessage: {
                            id: Date.now().toString(),
                            senderId: user.id,
                            receiverId: contact.id,
                            text: "Hey there! I just added you as a contact.",
                            timestamp: new Date(),
                            status: "sent",
                          },
                          unread: 0,
                        }
                        setConversations((prev) => [...prev, newConv])
                        setActiveConversation(newConv.id)
                        setMessages([])
                      }
                    }}
                  >
                    <Avatar className="h-10 w-10 border border-gray-700">
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                      <AvatarFallback className="bg-gray-700 text-purple-300">{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{contact.name}</div>
                      <div className="text-sm text-gray-400">{contact.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* New chat button */}
        <div className="p-4 border-t border-gray-800">
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all duration-300">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversationData ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 border border-gray-700">
                  <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                  <AvatarFallback className="bg-gray-700 text-purple-300">
                    {activeConversationData.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{activeConversationData.user.name}</div>
                  <div className="text-xs text-gray-400">Online • Typing...</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isUser = message.senderId === user?.id
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

                  return (
                    <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2 ${isUser ? "space-x-reverse" : ""}`}
                      >
                        {!isUser && showAvatar ? (
                          <Avatar className="h-8 w-8 border border-gray-700">
                            <AvatarImage
                              src={activeConversationData.user.avatar}
                              alt={activeConversationData.user.name}
                            />
                            <AvatarFallback className="bg-gray-700 text-purple-300">
                              {activeConversationData.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8" />
                        )}
                        <div className={`max-w-md ${isUser ? "message-user" : "message-contact"}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isUser
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                : "bg-gray-800 text-white"
                            }`}
                          >
                            {message.text}
                          </div>
                          <div className={`text-xs mt-1 text-gray-500 ${isUser ? "text-right" : "text-left"}`}>
                            {formatTime(message.timestamp)}
                            {isUser && <span className="ml-1">✓✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-end space-x-2">
                      <Avatar className="h-8 w-8 border border-gray-700">
                        <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                        <AvatarFallback className="bg-gray-700 text-purple-300">
                          {activeConversationData.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="px-4 py-2 rounded-2xl bg-gray-800 text-white message-contact">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-2"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing-3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
                <MessageSquare className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-medium text-white">No conversation selected</h3>
              <p className="text-gray-400 max-w-md">
                Select a conversation from the sidebar or start a new chat to begin messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

