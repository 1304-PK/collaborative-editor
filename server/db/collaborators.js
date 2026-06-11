const supabaseAdmin = require("../config/supabaseClient")

const getUserRole = async (boardId, userId) => {
    const { data, error } = await supabaseAdmin
        .from("collaborators")
        .select("role")
        .eq("whiteboard_id", boardId)
        .eq("user_id", userId)
        .single()

    return data?.role ?? null;
}

module.exports = {getUserRole}