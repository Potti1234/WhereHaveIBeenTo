'use client'

import { signOut } from '@/app/login/actions'
import { Button } from './ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { CircleUser } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getLoggedInUser } from '@/daos/user'

export default function HeaderDropdown () {
  const [profilePicture, setProfilePicture] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    const user = getLoggedInUser()
    setProfilePicture(user?.avatar)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' size='icon' className='rounded-full'>
          {profilePicture ? (
            <img src={profilePicture} className='h-5 w-5 rounded-full' />
          ) : (
            <CircleUser className='h-5 w-5' />
          )}
          <span className='sr-only'>Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel> My Account </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href='/profile' className='hover:text-foreground'>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href='/settings/general' className='hover:text-foreground'>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut()
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
