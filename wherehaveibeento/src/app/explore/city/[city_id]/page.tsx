"use server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/utils/supabase/server"

export default async function Page({ params }: { params: { city_id: string } }) {
  const supabase = createClient()

  const fetchCity = async () => {
    const { data, error } = await supabase.from('city')
    .select(`name, country(name, iso2)`)
    .eq("id", params.city_id)

      if (error) {
        console.error(error)
        return null
      } else if (data && data.length > 0) {
        return (data[0])
      }

  }
    const city : any = await fetchCity()

    return (
      <ScrollArea className="h-screen w-100%">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <h1 className="text-3xl font-bold text-center">Explore {city && (city.name)}</h1>
                <div className="mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                <Card>
                            <CardHeader>
                                <CardTitle>Country Name:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h3 className="text-2xl font-bold">
                                        {city && city.country.name}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Country Flag:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h3 className="text-2xl font-bold">
                                        {city && <img
                          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${city.country.iso2}.svg`}
                          alt="Flag"
                          className="mr-2 h-16 w-16"
                        />}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                      </div>
                </div>
            </main>
        </ScrollArea>
    )
  }