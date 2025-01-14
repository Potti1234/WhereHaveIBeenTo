'use client'

import { Button } from '@/components/ui/button'
import { handleOAuthLogin } from './actions'

type OAuthProvider = {
  name: string
  displayName: string
}

export function OAuthSignIn () {
  const oAuthProviders: OAuthProvider[] = [
    {
      name: 'google',
      displayName: 'Google'
    }
  ]

  return (
    <>
      {oAuthProviders.map((provider, index) => (
        <Button
          key={index}
          className='w-full flex items-center justify-center gap-2'
          variant='outline'
          onClick={async () => {
            await handleOAuthLogin(provider.name)
          }}
        >
          Login with {provider.displayName}
        </Button>
      ))}
    </>
  )
}
