"use server"

import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/utils/supabase/server"
import CountryCard from "@/components/countryCard"

export default async function Page() {
  const supabase = createClient()

  const fetchRandomCountries = async () => {
    const { data, error } = await supabase.rpc('get_random_countries', { amount : 21})

      if (error) {
        console.error(error)
        return null
      } else if (data && data.length > 0) {
        return data
      }

  }
    const countries = await fetchRandomCountries()

    return (
      <ScrollArea className="h-screen w-100%">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <h1 className="text-3xl font-bold text-center">Explore Countries</h1>
                <div className="mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground">
                    <div className="grid grid-cols-3 gap-4">
                        {countries && (countries.map((country: any, index: any) => (
                          <div key={index}>
                            <CountryCard country={country}/>
                          </div>
                        )))}
                    </div>
                </div>
            </main>
        </ScrollArea>
    )
  }