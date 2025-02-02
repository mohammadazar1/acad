import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabase } from '../../../../lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "البريد الإلكتروني", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
        }

        const { data: user, error } = await supabase
          .from('users')
          .select(`
            *,
            academies (
              id,
              name,
              status
            )
          `)
          .eq('email', credentials.email)
          .single()

        if (error || !user) {
          throw new Error('البريد الإلكتروني غير مسجل')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('كلمة المرور غير صحيحة')
        }

        // Check academy status
        if (user.role === 'ACADEMY' && user.academies) {
          if (user.academies.status === 'suspended') {
            throw new Error('تم تعليق حساب الأكاديمية الخاص بك')
          }
          if (user.academies.status === 'deleted') {
            throw new Error('تم حذف حساب الأكاديمية الخاص بك')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          academyId: user.academyId,
        }
      }
    }),
    CredentialsProvider({
      id: 'coach-credentials',
      name: 'Coach Credentials',
      credentials: {
        email: { label: "البريد الإلكتروني", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
        }

        const { data: coach, error } = await supabase
          .from('coaches')
          .select(`
            *,
            academies (
              id,
              name
            )
          `)
          .eq('email', credentials.email)
          .single()

        if (error || !coach) {
          throw new Error('البريد الإلكتروني غير مسجل')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          coach.password
        )

        if (!isPasswordValid) {
          throw new Error('كلمة المرور غير صحيحة')
        }

        return {
          id: coach.id,
          email: coach.email,
          name: coach.name,
          role: 'COACH',
          academyId: coach.academyId,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.academyId = user.academyId;
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.academyId = token.academyId as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

