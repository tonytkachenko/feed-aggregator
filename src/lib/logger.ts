import type { MiddlewareHandler } from "hono";
import pino from "pino";

import { getConfig } from "./config.js";

const config = getConfig();

const isProd = config.NODE_ENV === "production";
const level = isProd ? "info" : "debug";
const errorSerializer = isProd
  ? (err: unknown) => {
      if (err instanceof Error) {
        return { type: err.name, message: err.message };
      }
      if (err && typeof err === "object" && "message" in err) {
        return { message: String((err as { message?: unknown }).message) };
      }
      return { message: String(err) };
    }
  : pino.stdSerializers.err;

export const logger = pino(
  {
    level,
    base: null,
    browser: { asObject: true },
    serializers: { err: errorSerializer },
  },
  isProd
    ? undefined
    : pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }),
);

export const requestLogger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();

  try {
    await next();
  } finally {
    const durationMs = Date.now() - start;
    logger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs,
      },
      "request",
    );
  }
};
