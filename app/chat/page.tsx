"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LogOut, Send, Plus, Phone, Video, X } from "lucide-react"
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

  const [callType, setCallType] = useState<"voice" | "video" | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState<"dark" | "purple" | "blue">("dark")
  const [hiddenChats, setHiddenChats] = useState<string[]>([])

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleConversationChange = (conversationId: string) => {
    setActiveConversation(conversationId)
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv)),
    )

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

  const CallModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 text-white p-6"
      onClick={() => setCallType(null)}
    >
      <div
        className="bg-gray-800 rounded-2xl p-8 w-96 max-w-full text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-semibold mb-4">{callType === "voice" ? "Voice Call" : "Video Call"}</h2>
        <p className="mb-6 text-lg">
          {callType === "voice"
            ? `Calling ${activeConversationData?.user.name}...`
            : `Video calling ${activeConversationData?.user.name}...`}
        </p>

        {callType === "video" && (
          <div className="bg-black rounded-xl mb-6 w-full h-48 flex items-center justify-center border border-gray-700 shadow-inner">
            <p className="text-gray-400 italic select-none">[Video feed placeholder]</p>
          </div>
        )}

        <Button
          variant="destructive"
          onClick={() => setCallType(null)}
          className="px-8 py-3 text-lg flex items-center justify-center gap-3 mx-auto rounded-full shadow hover:bg-red-700 transition"
        >
          <X className="w-6 h-6" />
          End Call
        </Button>
      </div>
    </div>
  )

  const SettingsModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6"
      onClick={() => setSettingsOpen(false)}
    >
      <div
        className="bg-gray-900 rounded-2xl p-8 w-96 max-w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-semibold mb-6 text-white">Settings</h3>

        <div className="mb-8">
          <h4 className="text-lg text-white font-semibold mb-3">Hide Chats</h4>
          {conversations.length === 0 && <p className="text-gray-400">No chats available.</p>}
          <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800 shadow-inner">
            {conversations.map((conv) => (
              <label
                key={conv.id}
                className="flex items-center justify-between p-2 cursor-pointer select-none hover:bg-gray-700 rounded-md transition"
              >
                <span className="text-white font-medium">{conv.user.name}</span>
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
                  className="cursor-pointer w-5 h-5 rounded border-gray-600 bg-gray-700 checked:bg-purple-600 checked:border-transparent transition"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg text-white font-semibold mb-3">Change Theme</h4>
          <div className="flex space-x-4">
            {["dark", "purple", "blue"].map((t) => (
              <button
                key={t}
                className={`w-10 h-10 rounded-full border-4 focus:outline-none transition-transform hover:scale-110 ${
                  theme === t ? "border-white shadow-lg" : "border-transparent"
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
          className="mt-8 w-full rounded-full shadow hover:bg-gray-700 transition"
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
    <div className={`min-h-screen flex flex-col ${themeClasses[theme]} font-sans`}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-800 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight select-none">Night Chat</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setSettingsOpen(true)}
            className="rounded-full px-4 py-2 shadow-md hover:bg-gray-700 transition"
          >
            Settings
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="rounded-full px-4 py-2 flex items-center space-x-2 shadow-md hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-gray-700 flex flex-col bg-gray-850">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold tracking-wide">Chats</h2>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full hover:bg-purple-600 hover:text-white transition"
              onClick={handleNewChat}
              aria-label="Start new chat"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3">
            {conversations.length === 0 && (
              <p className="text-gray-400 p-3 text-center italic">No conversations available.</p>
            )}

            {conversations
              .filter((conv) => !hiddenChats.includes(conv.id))
              .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleConversationChange(conv.id)}
                  className={`flex items-center w-full p-3 mb-2 rounded-lg text-left transition-colors duration-200
                    ${
                      activeConversation === conv.id
                        ? "bg-purple-600 text-white shadow-lg"
                        : "hover:bg-gray-800 text-gray-300"
                    }`}
                >
                  <Avatar className="flex-shrink-0">
                    {conv.user.avatar && conv.user.avatar.trim() !== "" ? (
                      <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                    ) : (
                      <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-3 flex flex-col flex-grow min-w-0">
                    <span className="font-semibold truncate">{conv.user.name}</span>
                    <span className="text-sm text-gray-400 truncate">{conv.lastMessage.text}</span>
                  </div>
                  {conv.unread > 0 && (
                    <div className="ml-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      {conv.unread}
                    </div>
                  )}
                </button>
              ))}
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <section className="flex flex-col flex-grow relative">
          {activeConversationData ? (
            <>
              <header className="flex items-center justify-between border-b border-gray-700 p-4 bg-gray-850 shadow-sm">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    {activeConversationData.user.avatar && activeConversationData.user.avatar.trim() !== "" ? (
                      <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                    ) : (
                      <AvatarFallback>{activeConversationData.user.name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{activeConversationData.user.name}</h3>
                    <p className="text-sm text-gray-400 select-none">Online</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Start voice call"
                    onClick={() => setCallType("voice")}
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Start video call"
                    onClick={() => setCallType("video")}
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                </div>
              </header>

              <ScrollArea className="flex-grow p-4 space-y-3 overflow-y-auto">
                {messages.length === 0 && <p className="text-center text-gray-400">No messages yet</p>}

                {messages.map((msg) => {
                  const isUserMsg = msg.senderId === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${isUserMsg ? "justify-end" : "justify-start"}`}
                    >
                      {!isUserMsg && (
                        <Avatar className="flex-shrink-0">
                          {activeConversationData.user.avatar && activeConversationData.user.avatar.trim() !== "" ? (
                            <AvatarImage src={activeConversationData.user.avatar} alt={activeConversationData.user.name} />
                          ) : (
                            <AvatarFallback>{activeConversationData.user.name[0]}</AvatarFallback>
                          )}
                        </Avatar>
                      )}

                      <div
                        className={`max-w-xs rounded-lg p-3 text-sm shadow-sm whitespace-pre-wrap ${
                          isUserMsg
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-gray-800 text-gray-300 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                        <div className="mt-1 text-xs text-gray-400 text-right select-none">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>

                      {isUserMsg && (
                        <Avatar className="flex-shrink-0">
                          {user && user.avatar && user.avatar.trim() !== "" ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback>{user?.name[0]}</AvatarFallback>
                          )}
                        </Avatar>
                      )}
                    </div>
                  )
                })}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-400 italic px-3">
                    <span>Typing...</span>
                    <svg
                      className="animate-pulse w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </ScrollArea>

              <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-700 p-4 bg-gray-850 flex items-center gap-3"
              >
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  autoFocus
                  aria-label="Message input"
                  className="flex-grow"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="rounded-full p-3"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col flex-grow items-center justify-center p-6 text-gray-400 select-none">
              <p className="text-xl mb-4">No active conversation selected</p>
              <Button
                onClick={handleNewChat}
                className="rounded-full px-6 py-3 shadow hover:bg-purple-600 hover:text-white transition"
              >
                Start a new chat
              </Button>
            </div>
          )}
        </section>
      </main>

      {callType && <CallModal />}
      {settingsOpen && <SettingsModal />}
    </div>
  )
}
