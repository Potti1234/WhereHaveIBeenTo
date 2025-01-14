import { pb } from "../lib/pocketbase";

export function getLoggedInUser() {
  return pb.authStore.record
}

  export function checkUserIsLoggedIn() {
    return pb.authStore.isValid
  }
  
  export function checkEmailIsVerified() {
    return pb.authStore.record?.verified
  }
  
  export function checkVerifiedUserIsLoggedIn() {
    return checkUserIsLoggedIn() && checkEmailIsVerified()
  }
  
  export async function authRefresh() {
    if (!checkUserIsLoggedIn()) return
    await pb.collection('users').authRefresh({ requestKey: null })
  }
  
  export async function sendVerificationEmail(email: string) {
    await pb.collection('users').requestVerification(email)
  }
  
  export async function createNewUser(newUserData: {
    name: string
    email: string
    password: string
    passwordConfirm: string
  }) {
    await pb.collection('users').create({ ...newUserData, emailVisibility: true })
    await sendVerificationEmail(newUserData.email)
  }
  
  export async function verifyEmailByToken(token: string) {
    await pb.collection('users').confirmVerification(token, { requestKey: null })
    if (pb.authStore.record) await authRefresh()
  }
  
  export async function loginWithPassword(email: string, password: string) {
    const authResult = await pb
      .collection('users')
      .authWithPassword(email, password)
    return authResult
  }
  
  export async function loginWithOAuth(provider: string) {
    const authResult = await pb
      .collection('users')
      .authWithOAuth2({ provider: provider })
    await authRefresh()
    return authResult
  }
  
  export function logout() {
    pb.authStore.clear()
  }
  
  export async function requestPasswordReset(email: string) {
    await pb.collection('users').requestPasswordReset(email)
  }
  
  export async function confirmPasswordReset(
    password: string,
    passwordConfirm: string,
    token: string
  ) {
    await pb
      .collection('users')
      .confirmPasswordReset(token, password, passwordConfirm)
    if (pb.authStore.record)
      await loginWithPassword(pb.authStore.record.email, password)
  }