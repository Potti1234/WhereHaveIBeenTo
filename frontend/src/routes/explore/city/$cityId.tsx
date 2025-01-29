import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCity } from '@/hooks/use-city'
import { useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

function CityPage() {
  const { cityId } = useParams({ from: '/explore/city/$cityId' })
  const { cityWithCountry } = useCity(cityId)

  return (
    <ScrollArea className="h-screen w-100%">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <h1 className="text-3xl font-bold text-center">
          Explore {cityWithCountry?.name}
        </h1>
        <div className="mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Country Name:</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <h3 className="text-2xl font-bold">
                    {cityWithCountry?.expand.country.name}
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
                    {cityWithCountry && (
                      <img
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${cityWithCountry.expand.country.iso2}.svg`}
                        alt="Flag"
                        className="mr-2 h-16 w-16"
                      />
                    )}
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

export const Route = createFileRoute('/explore/city/$cityId')({
  component: CityPage,
  beforeLoad: () => {
    return { getTitle: () => 'City Details' }
  },
})
