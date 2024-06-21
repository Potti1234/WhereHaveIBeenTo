import { createClient } from "@/utils/supabase/client"
import getCurrentUserId from "./user"

export async function saveArticleClient(content: string, city_id: number) {
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

export async function getArticleClient(article_id: number) {
    const supabase = createClient()

    const { data, error } = await supabase.from('article')
    .select(`*`)
    .eq("id", article_id)

    if (error) {
        console.error(error)
        return null
    } else if (data && data.length > 0) {
        return (data[0])
    }
}