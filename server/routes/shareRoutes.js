const express = require("express")
const router = express.Router()

const supabaseAdmin = require("../config/supabaseClient")

// Import middlewares
const boardAccess = require("../middlewares/boardAccess")

router.post("/add-collaborator", boardAccess, async (req, res) => {
    if (req.userRole != "owner") {
        return res.status(401).json({ detail: "Unauthorized to add collaborators" })
    }

    const { email, role, whiteboard_id } = req.body
    if (!email || !role) res.status(400).json({ detail: "Required fields missing" })

    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle()

        // Vague message to prevent user enumeration
        if (error) throw new Error("Unable to add collaborator")

        const { data: cData, error: cError } = await supabaseAdmin
            .from("collaborators")
            .insert([
                {
                    whiteboard_id: whiteboard_id,
                    user_id: data.id,
                    role: role
                }
            ])

        if (cError) throw new Error("Unable to add collaborator")

        return res.status(200).json({ message: "Collaborator successfully added" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }


})

module.exports = router