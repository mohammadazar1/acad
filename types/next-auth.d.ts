declare module "next-auth" {
  interface Session {
    user: {
      id: string
      coach_id?: string
      name: string
      email: string
      role: string
      academyId: string
      academyName: string
    }
  }

  interface User {
    id: string
    coach_id?: string
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
    coach_id?: string
    role: string
    academyId: string
    academyName: string
  }
}

