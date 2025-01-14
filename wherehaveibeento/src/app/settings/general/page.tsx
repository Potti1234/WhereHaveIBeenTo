'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLoggedInUser } from '@/daos/user'

export default function Page () {
  const supabase = createClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = getLoggedInUser()
    setUserId(user?.id || null)
  }, [])

  function handleFileChange (event: React.ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null)
    const file = event.target.files?.[0]
    if (file) {
      const fileType = file.type
      const fileSize = file.size / 1024 / 1024 // in MB
      if (fileType !== 'image/png') {
        setErrorMessage('Only PNG files are allowed.')
      } else if (fileSize > 1) {
        setErrorMessage('File size should be smaller than 1 MB.')
      } else {
        setSelectedFile(file)
        setErrorMessage(null)
      }
    }
  }

  function updateProfilePicture () {
    if (selectedFile && errorMessage === null) {
      // save the file to storage
      supabase.storage
        .from('profile_pictures')
        .upload(`${userId}.png`, selectedFile, { upsert: true })
        .then(({ data, error }: { data: any; error: any }) => {
          if (error) {
            console.error(error)
            setErrorMessage('Failed to upload the file.')
            return
          }
          // update the user profile table with the file URL
          let profile_picture_url = data.path

          supabase
            .from('profiles')
            .update({ profile_picture_url })
            .eq('id', userId)
            .select()
            .then(({ error }) => {
              if (error) {
                console.error(error)
                setErrorMessage('Failed to update the profile picture URL.')
                return
              }
              setErrorMessage(null)
            })
        })
    } else {
      setErrorMessage('Please select a file.')
    }
  }

  return (
    <div className='grid gap-6'>
      <Card x-chunk='dashboard-04-chunk-1'>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Used to identify your user more easily
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <Input
              type='file'
              placeholder='Upload profile picture'
              onChange={handleFileChange}
            />
            {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
          </form>
        </CardContent>
        <CardFooter className='border-t px-6 py-4'>
          <Button onClick={updateProfilePicture}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
