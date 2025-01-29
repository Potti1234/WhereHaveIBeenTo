import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'
import { Outlet } from '@tanstack/react-router'
import { createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ScrollRestoration } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => {
    return (
      <div className='mx-auto flex min-h-dvh flex-col gap-4 px-4 py-2'>
        <Header />
        <ScrollRestoration />
        <Outlet />
        <Toaster position='bottom-center' toastOptions={{ duration: 2500 }} />
        {process.env.NODE_ENV === 'development' && (
          <TanStackRouterDevtools position='bottom-right' />
        )}
        <Footer />
      </div>
    )
  }
})
