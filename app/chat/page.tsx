"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LogOut,
  Send,
  Plus,
  Search,
  MoreVertical,
  Phone,
  Video,
  Users,
  MessageSquare,
  X,
} from "lucide-react"
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

  // --- NEW STATES ---
  const [callType, setCallType] = useState<"voice" | "video" | null>(null) // null means no call ongoing
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "purple" | "blue">("dark") // Removed "light" theme
  const [hiddenChats, setHiddenChats] = useState<string[]>([]) // ids of hidden chats

  // Load user and initial data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(storedUser) as UserType
    setUser(userData)

    const demoContacts = Array.from({ length: 8 }, () => getRandomUser())
    setContacts(demoContacts)

    const demoConversations = demoContacts.map((contact) => ({
      id: contact.id,
      user: contact,
      lastMessage: generateRandomMessage(contact.id, userData.id, true),
      unread: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
    }))
    setConversations(demoConversations)

    if (demoConversations.length > 0) {
      setActiveConversation(demoConversations[0].id)

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

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleConversationChange = (conversationId: string) => {
    setActiveConversation(conversationId)
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv)))

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

    setConversations((prev) =>
      prev.map((conv) => (conv.id === activeConversation ? { ...conv, lastMessage: userMessage } : conv)),
    )

    setIsTyping(true)

    const replyDelay = 1000 + Math.random() * 2000
    setTimeout(() => {
      setIsTyping(false)

      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: conversation.user.id,
        receiverId: user.id,
        text: getRandomReply(),
        timestamp: new Date(),
        status: "delivered",
      }

      setMessages((prev) => [...prev, replyMessage])

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

  const handleNewChat = () => {
    setActiveConversation(null)
    setMessages([])
  }

  const activeConversationData = conversations.find((c) => c.id === activeConversation)

  // --- Call Modal JSX ---
  const CallModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 text-white p-6"
      onClick={() => setCallType(null)}
    >
      <div
        className="bg-gray-900 rounded-xl p-8 w-96 max-w-full text-center relative"
        onClick={(e) => e.stopPropagation()} // prevent modal close on click inside
      >
        <h2 className="text-2xl mb-4">{callType === "voice" ? "Voice Call" : "Video Call"}</h2>
        <p className="mb-6">
          {callType === "voice"
            ? `Calling ${activeConversationData?.user.name}...`
            : `Video calling ${activeConversationData?.user.name}...`}
        </p>

        {/* For video call, show a placeholder video box */}
        {callType === "video" && (
          <div className="bg-black rounded-lg mb-6 w-full h-48 flex items-center justify-center border border-gray-700">
            <p className="text-gray-500 italic">[Video feed placeholder]</p>
          </div>
        )}

        <Button
          variant="destructive"
          onClick={() => setCallType(null)}
          className="px-6 py-2 text-lg flex items-center justify-center gap-2 mx-auto"
        >
          <X className="w-5 h-5" />
          End Call
        </Button>
      </div>
    </div>
  )

  // --- Settings Modal JSX ---
  const SettingsModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="bg-gray-900 rounded-xl p-6 w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4 text-white">Settings</h3>

        {/* Hide Chats Section */}
        <div className="mb-6">
          <h4 className="text-lg text-white font-medium mb-2">Hide Chats</h4>
          {conversations.length === 0 && <p className="text-gray-400">No chats available.</p>}
          <div className="max-h-40 overflow-y-auto border border-gray-700 rounded p-2 bg-gray-800">
            {conversations.map((conv) => (
              <label
                key={conv.id}
                className="flex items-center justify-between p-1 cursor-pointer select-none"
              >
                <span className="text-white">{conv.user.name}</span>
                <input
                  type="checkbox"
                  checked={hiddenChats.includes(conv.id)}
                  onChange={() => {
                    setHiddenChats((prev) =>
                      prev.includes(conv.id)
                        ? prev.filter((id) => id !== conv.id)
                        : [...prev, conv.id],
                    )
                  }}
                  className="cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Theme / Color selection */}
        <div>
          <h4 className="text-lg text-white font-medium mb-2">Change Theme</h4>
          <div className="flex space-x-3">
            {["dark", "purple", "blue"].map((t) => (
              <button
                key={t}
                className={`w-8 h-8 rounded-full border-2 ${
                  theme === t ? "border-white" : "border-transparent"
                }`}
                style={{
                  background:
                    t === "dark"
                      ? "#111827"
                      : t === "purple"
                      ? "#7c3aed"
                      : "#2563eb",
                }}
                onClick={() => setTheme(t as any)}
                aria-label={`Select ${t} theme`}
              />
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => setSettingsOpen(false)}
          className="mt-6 w-full"
        >
          Close
        </Button>
      </div>
    </div>
  )

  const themeClasses = {
    dark: "bg-gray-900 text-white",
    purple: "bg-purple-900 text-purple-100",
    blue: "bg-blue-900 text-blue-100",
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses[theme]}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h1 className="text-2xl font-bold">ChatApp</h1>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setSettingsOpen(true)}>Settings</Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar / Contacts and Conversations */}
        <aside className="w-80 border-r border-gray-700 flex flex-col">
          {/* New Chat Button */}
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chats</h2>
            <Button size="sm" variant="outline" onClick={handleNewChat}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 p-2">
            {conversations.length === 0 && (
              <p className="text-gray-400 p-2">No conversations available.</p>
            )}

            {conversations
              .filter((conv) => !hiddenChats.includes(conv.id))
              .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleConversationChange(conv.id)}
                  className={`flex items-center w-full p-2 mb-1 rounded-md text-left hover:bg-gray-800 ${
                    activeConversation === conv.id ? "bg-gray-800" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                    <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                  </Avatar>

                  {/* Added pr-10 for spacing so unread badge doesn't cover text */}
                  <div className="ml-3 flex-1 overflow-hidden pr-10">
                    <p className="text-sm font-semibold truncate">{conv.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage.text}</p>
                  </div>

                  {conv.unread > 0 && (
                    <span className="text-xs bg-red-600 rounded-full px-2 py-0.5 text-white min-w-[20px] text-center">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            {activeConversationData ? (
              <>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                    <AvatarFallback>{activeConversationData.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold">{activeConversationData.user.name}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCallType("voice")}
                    aria-label="Start voice call"
                  >
                    <Phone />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCallType("video")}
                    aria-label="Start video call"
                  >
                    <Video />
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Select a conversation or start a new chat.</p>
            )}
          </div>

          {/* Messages List */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && <p className="text-gray-400">No messages yet.</p>}

            <div className="space-y-4">
              {messages.map((msg) => {
                const isUser = user && msg.senderId === user.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isUser ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="text-xs text-gray-300 block mt-1 text-right">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-700 text-gray-100 italic text-sm">
                    Typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-700 p-4 flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={!activeConversation}
              aria-label="Message input"
            />
            <Button type="submit" disabled={!newMessage.trim() || !activeConversation} aria-label="Send message">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </section>
      </main>

      {/* Modals */}
      {callType && <CallModal />}
      {settingsOpen && <SettingsModal />}
    </div>
  )
}
