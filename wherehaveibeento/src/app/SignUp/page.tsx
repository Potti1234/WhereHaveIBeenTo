"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/utils/supabase/client'
import React from "react"

export default function SignUp() {
    const supabase = createClient()
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    function loginWithGoogle() {
        supabase.auth.signInWithOAuth({
            provider: 'google',
          })
    }  

    async function signUpNewUser() {
        console.log(email)
        console.log(password)
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        })
        console.log(data)
        console.log(error)
      }
      

return (
    <Card className="mx-auto my-40 max-w-sm">
        <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
                Enter your information to create an account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6} 
                    />
                </div>
                <Button type="submit" className="w-full" onClick={signUpNewUser}>
                    Create an account
                </Button>
                <Button variant="outline" className="w-full" onClick={loginWithGoogle}>
                    Sign up with Google
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/Login" className="underline">
                    Sign in
                </Link>
            </div>
        </CardContent>
    </Card>
)
}
