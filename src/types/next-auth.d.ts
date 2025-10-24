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
    }
  }

  interface User {
    role: string
    isSubscribed: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    isSubscribed: boolean
  }
}
