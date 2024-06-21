import * as React from "react"

import useMediaQuery from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ArticleEditor } from "./articleEditor"
import { saveArticleClient } from "@/daos/article"
import { DialogClose } from "@radix-ui/react-dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export default function WriteArticleModal(props: { city_id: number}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [articleValue, setArticleValue] = React.useState<any>();
  const [titleValue, setTitleValue] = React.useState<string>("");

    const saveArticle = () => {
        saveArticleClient(JSON.stringify(articleValue), titleValue, props.city_id);
    }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Add Article</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write Article</DialogTitle>
            <DialogDescription>
              Write Article about your trip to this city.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Title</Label>
            <Input type="string" id="title" placeholder="Title" onChange={(e) => setTitleValue(e.target.value)}/>
          </div>
          <ArticleEditor onChangeCallback={setArticleValue} initialValue={null} readOnly={false}/>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default" onClick={saveArticle}>Save</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default">Add Article</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Write Article</DrawerTitle>
          <DrawerDescription>
          Write Article about your trip to this city.
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Title</Label>
            <Input type="string" id="title" placeholder="Title" onChange={(e) => setTitleValue(e.target.value)}/>
        </div>
        <ArticleEditor onChangeCallback={setArticleValue} initialValue={null} readOnly={false}/>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="default" onClick={saveArticle}>Save</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
