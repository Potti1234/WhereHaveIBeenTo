import { createClient } from "@/utils/supabase/client"

export async function getCityClient(city_id: number) : Promise<any>{
    const supabase = createClient()

    return supabase.from('city')
    .select(`*`)
    .eq("id", city_id)
}