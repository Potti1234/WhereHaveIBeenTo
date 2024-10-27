'use client'

import SettingsNavigation from '@/components/settingsNavigation'
import { createClient } from '@/utils/supabase/client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!data.user || error) {
        return router.push('/login')
      }
    })
  }, [])

  return (
    <SettingsNavigation highlightedLink={pathname.split('/')[2]}>
      {children}
    </SettingsNavigation>
  )
}
