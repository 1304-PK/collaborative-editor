const supabaseAdmin = require("../config/supabaseClient")

const getUserRole = async (boardId, userId) => {
    const { data, error } = await supabaseAdmin
        .from("collaborators")
        .select("role")
        .eq("whiteboard_id", boardId)
        .eq("user_id", userId)

    if (error) throw new Error("Don't have access to the board");

    return data?.role ?? null;
}

module.exports = {getUserRole}