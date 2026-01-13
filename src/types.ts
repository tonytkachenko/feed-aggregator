import { z } from "zod";

export const aggregateQuerySchema = z.object({
  list: z.url(),
});

export type AggregateQuery = z.infer<typeof aggregateQuerySchema>;

// Product item - any fields
export type ProductItem = Record<string, any>;

// Aggregation metadata
export interface AggregationMetadata {
  totalItems: number;
  totalFeeds: number;
  successfulFeeds: number;
  failedFeeds: number;
  timestamp: string;
  duration: number;
}
