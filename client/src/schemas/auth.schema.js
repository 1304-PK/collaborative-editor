import {z} from "zod"

export const AuthSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(6, "Minimum length of password should be 6")
})