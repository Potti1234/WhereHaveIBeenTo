import { Database } from "./supabase";


export type Country = Database["public"]["Tables"]["country"]["Row"]
export type City = Database["public"]["Tables"]["city"]["Row"]
export type State = Database["public"]["Tables"]["state"]["Row"]