import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      isSubscribed: boolean
      trustScore?: number
    }
  }

  interface User {
    role: string
    isSubscribed: boolean
    trustScore?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    isSubscribed: boolean
    trustScore?: number
  }
}
