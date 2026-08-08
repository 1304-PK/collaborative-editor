import {z} from "zod"


export const CollabInfoSchema = z.object({
    email: z.email("Enter a valid email"),
    role: z.enum(["editor", "viewer"], {
        error: "Enter a valid role"
    })
})

export const WhiteboardSchema = z.object({
    boardName: z.string().min(3, "Board name length should be more than 3")
})