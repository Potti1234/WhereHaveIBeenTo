"use client"

import { ArticleEditor } from "@/components/articleEditor"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getArticleClient } from "@/daos/article"

export default async function Page({ params }: { params: { article_id: number } }) {

    const article = await getArticleClient(params.article_id)

    return (
      <ScrollArea className="h-screen w-100%">
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <h1 className="text-3xl font-bold text-center">{article.title}</h1>
                <div className="mx-auto w-full max-w-6xl items-center gap-6 grid gap-6 text-sm text-muted-foreground">
                    
                    <ArticleEditor onChangeCallback={null} initialValue={JSON.parse(article.content)} readOnly={true}/>
                </div>
            </main>
        </ScrollArea>
    )
  }