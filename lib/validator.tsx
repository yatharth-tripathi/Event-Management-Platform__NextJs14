import * as z from "zod"

export const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(400, 'Description must be less than 400 characters'),
  location: z.string().min(3, 'Location must be at least 3 characters').max(400, 'Location must be less than 400 characters'),
  eventLatitude: z.string().min(2, 'Latitude must be at least 2').max(50, 'Latitude must be at most 50'),
  eventLongitude: z.string().min(2, 'Longitude must be at least 2').max(50, 'Longitude must be at most 50'),
  imageUrl: z.string(),
  date: z.date(),
  categoryId: z.string(),
  price: z.string(),
  isFree: z.boolean(),
  url: z.string().url(),
  isVirtual: z.boolean().default(false),
  meetingUrl: z.string().url().optional(),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional()
})

// search events by date ,user Latitude,  user Longitude
export const searchEventFormSchema = z.object({
  date: z.date(),
  userLatitude: z.string().min(2, 'Latitude must be at least 2').max(50, 'Latitude must be at most 50'),
  userLongitude: z.string().min(2, 'Longitude must be at least 2').max(50, 'Longitude must be at most 50'),
})