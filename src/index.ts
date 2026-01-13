import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { FeedAggregator, getConfig, logger, requestLogger } from "./lib/index.js";
import { aggregateQuerySchema } from "./types.js";

const app = new Hono();
const config = getConfig();

// Middleware
app.use("*", requestLogger);
app.use("*", cors());

// Health check
app.get("/", (c) => {
  return c.json({
    service: "feed-aggregator",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Main aggregation endpoint
app.get("/aggregate", zValidator("query", aggregateQuerySchema), async (c) => {
  try {
    const { list } = c.req.valid("query");

    const aggregator = new FeedAggregator(config.REQUEST_TIMEOUT_MS);
    const { xml, metadata } = await aggregator.aggregate(list);

    // Return XML with metadata in headers
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "X-Total-Items": metadata.totalItems.toString(),
        "X-Total-Feeds": metadata.totalFeeds.toString(),
        "X-Successful-Feeds": metadata.successfulFeeds.toString(),
        "X-Failed-Feeds": metadata.failedFeeds.toString(),
        "X-Duration-Ms": metadata.duration.toString(),
        "X-Timestamp": metadata.timestamp,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Aggregation error");

    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export default app;
