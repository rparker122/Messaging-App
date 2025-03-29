import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Message, User } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format time for messages and conversations
export function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()

  // If less than 24 hours, show time
  if (diff < 24 * 60 * 60 * 1000) {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // If less than 7 days, show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return new Date(date).toLocaleDateString([], { weekday: "short" })
  }

  // Otherwise show date
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" })
}

// Generate random user for demo
export function getRandomUser(): User {
  const id = Math.random().toString(36).substring(2, 10)
  const names = [
    "Alex Johnson",
    "Taylor Smith",
    "Jordan Lee",
    "Casey Brown",
    "Riley Wilson",
    "Morgan Davis",
    "Jamie Miller",
    "Quinn Thomas",
    "Avery White",
    "Jordan Garcia",
    "Drew Martinez",
    "Skyler Robinson",
  ]
  const name = names[Math.floor(Math.random() * names.length)]

  return {
    id,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
    avatar: `/placeholder.svg?height=40&width=40`,
  }
}

// Generate random message for demo
export function generateRandomMessage(
  senderId: string,
  receiverId: string,
  isLastMessage = false,
  timestamp: Date = new Date(),
): Message {
  const messages = [
    "Hey, how's it going?",
    "What are you up to today?",
    "Did you see that new movie?",
    "I was thinking about grabbing lunch later",
    "Can we talk about the project?",
    "Just checking in!",
    "Have you heard the news?",
    "I'll be there in 10 minutes",
    "Thanks for your help yesterday",
    "Let me know when you're free",
    "I found this cool new app",
    "Are we still on for tomorrow?",
    "Sorry I missed your call",
    "That's awesome! Congrats!",
    "I need your advice on something",
  ]

  // For last messages, use shorter texts
  const text = isLastMessage
    ? messages[Math.floor(Math.random() * 5)]
    : messages[Math.floor(Math.random() * messages.length)]

  return {
    id: Math.random().toString(36).substring(2, 10),
    senderId,
    receiverId,
    text,
    timestamp,
    status: "delivered",
  }
}

// Generate random reply for demo
export function getRandomReply(): string {
  const replies = [
    "Hey! I'm doing well, thanks for asking.",
    "Not much, just working. How about you?",
    "Yes! It was amazing. Have you seen it?",
    "Lunch sounds great! Where are you thinking?",
    "Sure, what aspect of the project?",
    "Hey there! Everything good?",
    "No, what happened?",
    "Perfect, I'll be waiting!",
    "No problem at all, happy to help.",
    "I should be free after 3pm.",
    "What's it called? I'll check it out.",
    "Yes, looking forward to it!",
    "No worries, we can talk now if you're free.",
    "Thank you! I'm really excited about it.",
    "Of course, what's up?",
  ]

  return replies[Math.floor(Math.random() * replies.length)]
}

