import { Link } from '@tanstack/react-router'

export default function SettingsNavigation (props: {
  highlightedLink: string
  children: React.ReactNode
}) {
  return (
    <main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
      <div className='mx-auto grid w-full max-w-6xl gap-2'>
        <h1 className='text-3xl font-semibold'>Settings</h1>
      </div>
      <div className='mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]'>
        <nav
          className='grid gap-4 text-sm text-muted-foreground'
          x-chunk='dashboard-04-chunk-0'
        >
          <Link
            to='/settings/general'
            className={
              props.highlightedLink === 'general'
                ? 'font-semibold text-primary'
                : ''
            }
          >
            General
          </Link>
        </nav>
        {props.children}
      </div>
    </main>
  )
}
