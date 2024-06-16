"use server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/utils/supabase/server"
import CountryWithStatesMap from "@/components/countryWithStatesMap"

export default async function Page({ params }: { params: { country_id: string } }) {
  const supabase = createClient()

  const fetchCountry = async () => {
    const { data, error } = await supabase.from('country')
    .select(`*`)
    .eq("id", params.country_id)

      if (error) {
        console.error(error)
        return null
      } else if (data && data.length > 0) {
        return (data[0])
      }

  }
    const country = await fetchCountry()

    return (
      <ScrollArea className="h-screen w-100%">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <h1 className="text-3xl font-bold text-center">Explore {country && (country.name)}</h1>
                <div className="mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground">
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Currency:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h3 className="text-2xl font-bold">
                                        {country && country.currency}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Name in Native Language:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h3 className="text-2xl font-bold">
                                        {country && country.native}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Nationality:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h3 className="text-2xl font-bold">
                                      {country && country.nationality}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <CountryWithStatesMap country={country || null} />
                </div>
            </main>
        </ScrollArea>
    )
  }