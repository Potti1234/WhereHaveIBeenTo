import { createClient } from "@/utils/supabase/client"
import getCurrentUserId from "./user"

export async function saveArticleClient(content: string, title: string, city_id: number) {
    const supabase = createClient()

    const author_id = await getCurrentUserId();

    supabase.from('article')
    .insert({ author_id, city_id, content, title})
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