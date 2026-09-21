import { z } from "zod"

// Mirrors the server password rule (8-128, upper, lower, digit).
export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128, "At most 128 characters")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[0-9]/, "Needs a digit")

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})
export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  phone: z
    .string()
    .optional()
    .or(z.literal("")),
})
export type SignupValues = z.infer<typeof signupSchema>

export const createPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })
export type CreatePasswordValues = z.infer<typeof createPasswordSchema>

export const sellerRegisterSchema = z.object({
  shop_name: z.string().min(1, "Shop name is required"),
  description: z.string().optional().or(z.literal("")),
})
export type SellerRegisterValues = z.infer<typeof sellerRegisterSchema>

export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().min(1, "Country is required"),
})
export type AddressValues = z.infer<typeof addressSchema>

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().or(z.literal("")),
})
export type ProfileValues = z.infer<typeof profileSchema>

export const shopProfileSchema = z.object({
  shop_name: z.string().min(1, "Shop name is required").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
})
export type ShopProfileValues = z.infer<typeof shopProfileSchema>

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be greater than 0"),
  currency: z.string().min(1).default("INR"),
  category: z.string().optional().or(z.literal("")),
  image: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  stock: z.coerce.number().int("Whole number").min(0, "Cannot be negative").default(0),
})
export type ProductValues = z.infer<typeof productSchema>
