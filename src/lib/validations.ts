import { z } from 'zod'

// Email validation
export const emailSchema = z.string().email('Invalid email address')

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
})

// Promo code schema
export const promoCodeSchema = z.object({
  code: z.string().min(3, 'Promo code must be at least 3 characters').max(20),
})

// Review/Testimonial schema
export const reviewSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  rating: z.number().min(1).max(5),
  message: z.string().min(10, 'Review must be at least 10 characters'),
})

// Types
export type ContactForm = z.infer<typeof contactSchema>
export type NewsletterForm = z.infer<typeof newsletterSchema>
export type PromoCode = z.infer<typeof promoCodeSchema>
export type ReviewForm = z.infer<typeof reviewSchema>