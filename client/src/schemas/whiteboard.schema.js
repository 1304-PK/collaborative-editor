import {z} from "zod"

export const WhiteboardSchema = z.object({
    boardName: z.string().min(3, "Board name length should be more than 3")
})

export const CollabInfoSchema = z.object({
    email: z.string().email("Enter a valid email"),
    role: z.enum(["editor", "viewer"], {
        error: "Enter a valid role"
    }),
    whiteboard_id: z.string()
})