import { z } from "zod"

export const assetSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Asset name is required").max(100, "Name must be less than 100 characters"),
  type: z.enum(['dataset', 'api', 'stream', 'model']),
  description: z.string().trim().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  category: z.string().trim().min(1, "Category is required"),
  producer: z.string().trim().min(1, "Producer/Organization is required").max(100, "Producer name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  format: z.string().optional(),
  size: z.string().optional(),
  endpoint: z.string().url("Invalid URL format").optional().or(z.literal("")),
  documentation: z.string().url("Invalid URL format").optional().or(z.literal("")),
  dataGovernance: z.object({
    hasPersonalData: z.boolean(),
    dataClassification: z.enum(['public', 'internal', 'confidential']),
    retentionPeriod: z.string().min(1, "Retention period is required"),
  }),
  technicalSpecs: z.object({
    updateFrequency: z.string().optional(),
    availability: z.string().optional(),
    authentication: z.string().optional(),
  }),
})

export const commentSchema = z.object({
  message: z.string().trim().min(1, "Comment cannot be empty").max(2000, "Comment must be less than 2000 characters"),
})

export type AssetSubmissionData = z.infer<typeof assetSubmissionSchema>
export type CommentData = z.infer<typeof commentSchema>