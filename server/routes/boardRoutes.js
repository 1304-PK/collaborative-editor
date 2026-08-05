const express = require("express")
const router = express.Router()

const supabaseAdmin = require("../config/supabaseClient")

// Import middlewares
const boardAccess = require("../middlewares/boardAccess")

router.get("/access/:boardId", boardAccess, async (req, res) => {
    try {

        const boardId = req.params.boardId
        const { data: boardData, error } = await supabaseAdmin
            .from('whiteboards')
            .select('title, canvas_data')
            .eq('id', boardId)
            .single()

        if (error) throw new Error(error)

        return res.status(200).json({boardData, userRole: req.userRole})
    }
    catch(err){
        console.log(err)
        return res.status(400).json({"message": err})
    }
})

module.exports = router