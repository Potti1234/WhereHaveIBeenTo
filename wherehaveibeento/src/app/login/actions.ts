'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { loginWithPassword, createNewUser, logout, loginWithOAuth, checkUserIsLoggedIn } from '@/daos/user'

export async function emailLogin(formData: FormData) {
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    await loginWithPassword(data.email, data.password).catch((error) => {
        redirect('/login?message=Could not authenticate user')
    })

    revalidatePath('/', 'layout')
    redirect('/map')
}

export async function signup(formData: FormData) {
    

    const data = {
        "password": formData.get('password') as string,
        "passwordConfirm": formData.get('password') as string,
        "email": formData.get('email') as string,
        "name": "Test"
    };

    await createNewUser(data).catch((error) => {
        redirect('/login?message=Could not authenticate user')
    })

    if (!checkUserIsLoggedIn()) {
        redirect('/login?message=Error signing up')
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function signOut() {
    logout()
    redirect('/login')
}

export const handleOAuthLogin = async (provider: string) => {
    try {
      await loginWithOAuth(provider)
      redirect('/map')
    } catch (error) {
        redirect('/login?message=Could not authenticate user')
    }
  }