import { createClient } from "@/utils/supabase/client"
import getCurrentUserId from "./user"

export default async function saveArticleClient(content: string, city_id: number) {
    const supabase = createClient()

    const user_id = await getCurrentUserId();

    supabase.from('article')
    .insert({ city_id, content: content, author_id: user_id})
    .then((value) => {
        if (value.error) {
            console.error(value.error)
        }
    })
}