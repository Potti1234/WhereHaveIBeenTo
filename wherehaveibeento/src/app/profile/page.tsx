"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
    const supabase = createClient();
    const [userId, setUserId] = useState<string | null>(null);
    const [visitedCountries, setVisitedCounties] = useState<any[]>([]);
    const [visitedStates, setVisitedStates] = useState<number>(0);
    const [visitedCities, setVisitedCities] = useState<number>(0);
    const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
    const [states, setStates] = useState<any[]>([]);
    const router = useRouter();

    const fetchVisitedCountries = async (user_id: string) => {
        const { data, error } = await supabase
            .from("distinct_visited_countries")
            .select(`*`)
            .eq("user_id", user_id);

        if (error) {
            console.error(error);
        } else {
            setVisitedCounties(data);
        }
    };

    const fetchVisitedStatesCount = async (user_id: string) => {
        const { count, error } = await supabase
            .from("distinct_visited_states")
            .select(`*`, { count: "exact", head: true })
            .eq("user_id", user_id);

        if (error) {
            console.error(error);
        } else {
            if (count) {
                setVisitedStates(count);
            }
        }
    };

    const fetchVisitedCitiesCount = async (user_id: string) => {
        const { count, error } = await supabase
            .from("visited_city")
            .select(`*`, { count: "exact", head: true })
            .eq("user_id", user_id);

        if (error) {
            console.error(error);
        } else {
            if (count) {
                setVisitedCities(count);
            }
        }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (!data.user || error) {
                return router.push("/login");
            }
            setUserId(data.user.id);
            fetchVisitedCountries(data.user.id);
            fetchVisitedStatesCount(data.user.id);
            fetchVisitedCitiesCount(data.user.id);
        });
    }, []);

    const handleCountryClick = (country: any) => {
        if (selectedCountry !== null && selectedCountry.name === country.name) {
            setSelectedCountry(null);
            return;
        }
        setSelectedCountry(country);
        fetchStates(country.name);
    };

    const fetchStates = async (name: string) => {
        const { data, error } = await supabase
            .from("distinct_visited_states")
            .select("*")
            .eq("country_name", name)
            .eq("user_id", userId);

        if (error) {
            console.error(error);
        } else if (data) {
            setStates(data);
        }
    };

    return (
        <ScrollArea className="h-100% w-100% rounded-md border">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <h1 className="text-3xl font-bold text-center">Profile</h1>
                <div className="mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground">
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Countries:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h1 className="text-4xl font-bold">
                                        {visitedCountries.length}
                                    </h1>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>States:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h1 className="text-4xl font-bold">{visitedStates}</h1>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cities:</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <h1 className="text-4xl font-bold">{visitedCities}</h1>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {selectedCountry === null && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Visited Countries</CardTitle>
                                <CardDescription>
                                    All of your visited countries. <br />
                                    Click on a flag to view the states.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-5 gap-2">
                                    {visitedCountries.map((country, index) => (
                                        <div key={index} className="flex items-center">
                                            <img
                                                onClick={() => handleCountryClick(country)}
                                                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.iso2}.svg`}
                                                alt="Flag"
                                                className="mr-2 h-16 w-16"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button onClick={() => router.push("/map")}>
                                    View on map
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                    {selectedCountry && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Visied States in {selectedCountry.name}</CardTitle>
                                <CardDescription>
                                    All of your visited states in {selectedCountry.name}. <br />
                                    Click on the flag to view the countries.
                                </CardDescription>
                                <img
                                    onClick={() => handleCountryClick(selectedCountry)}
                                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedCountry.iso2}.svg`}
                                    alt="Flag"
                                    className="mr-2 h-16 w-16"
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    {states.map((state: any, index: any) => (
                                        <div key={index} className="flex items-center">
                                            <p>{state.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </ScrollArea>
    );
}
