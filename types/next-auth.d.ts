import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      academyId: string
      academyName: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    academyId: string
    academyName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    academyId: string
    academyName: string
  }
}

