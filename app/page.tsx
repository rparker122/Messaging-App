import Head from "next/head"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, LogIn, UserPlus } from "lucide-react"

export default function Home() {
  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>NightChat — Secure Messaging</title>
        <meta
          name="description"
          content="Secure messaging in the dark. Connect with friends in style."
        />
      </Head>

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Decorative animated blobs */}
        <div className="animated-background" aria-hidden="true">
          <div className="animated-blob blob-1" aria-hidden="true"></div>
          <div className="animated-blob blob-2" aria-hidden="true"></div>
          <div className="animated-blob blob-3" aria-hidden="true"></div>
        </div>

        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-2 animate-fade-in">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-lg opacity-75 animate-pulse"></div>
                  <div className="relative bg-gray-900 rounded-full p-3 border border-gray-700">
                    <MessageSquare className="h-12 w-12 text-purple-400" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-white animate-slide-up">
                NightChat
              </h1>
              <p className="text-gray-400 md:text-xl animate-slide-up-delay">
                Secure messaging in the dark. Connect with friends in style.
              </p>
            </div>

            <div className="flex flex-col space-y-4 pt-4 animate-fade-in-delay">
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-purple-300 text-white group transition-all duration-300"
                >
                  <LogIn className="mr-2 h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all duration-300"
                >
                  <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="pt-8 animate-fade-in-delay-2">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="space-y-2 p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-colors duration-300">
                  <div className="font-medium text-purple-400">Secure</div>
                  <div className="text-gray-400">End-to-end encrypted</div>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-colors duration-300">
                  <div className="font-medium text-purple-400">Real-time</div>
                  <div className="text-gray-400">Instant messaging</div>
                </div>
                <div className="space-y-2 p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-colors duration-300">
                  <div className="font-medium text-purple-400">Dark Mode</div>
                  <div className="text-gray-400">Easy on the eyes</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
