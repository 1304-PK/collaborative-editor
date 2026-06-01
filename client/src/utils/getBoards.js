import { supabase } from "../lib/supabaseClient"

const getOwnedBoards = async (userId) => {
    try {
        const { data, error } = await supabase
            .from("whiteboards")
            .select("id, title")
            .eq("owner_id", userId)
            .order("created_at", { ascending: false })

        if (error) throw new Error(error.message)

        return data
    }
    catch (err) {
        console.error(err)
    }
}

const getSharedBoards = async (userId) => {
    try{
        const { data, error } = await supabase
        .from("collaborators")
        .select(`
                role,
                whiteboards (
                    id,
                    title,
                    created_at
                )
        `)
        .eq("user_id", userId)

        if (error) throw new Error(error.message)

        return data
    }
    catch(err){
        console.error(err)
    }
}

export {getOwnedBoards, getSharedBoards}