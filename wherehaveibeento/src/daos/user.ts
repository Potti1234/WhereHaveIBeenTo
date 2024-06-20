import { createClient } from "@/utils/supabase/client";

export default async function getCurrentUserId() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser()
    
    if (!data.user || error) {
        throw new Error("Error getting user");
    }
    return data.user.id;
    
}