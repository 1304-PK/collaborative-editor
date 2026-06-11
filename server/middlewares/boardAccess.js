const supabaseAdmin = require("../config/supabaseClient")
const { getUserRole } = require("../db/collaborators")

const boardAccess = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) return res.status(403).json({"message": "Missing Authentication Token"})
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) return res.status(404).json({"message": "User doesn't exist"})

    const role = await getUserRole(req.params.boardId, user.id)
    console.log(role)
    if (!['owner', 'editor', 'viewer'].includes(role))
        return res.status(401).json({"message": "User unauthorized"})

    req.userRole = role
    next()
}

module.exports = boardAccess