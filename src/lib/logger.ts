import type { MiddlewareHandler } from "hono";
import pino from "pino";

import { getConfig } from "./config.js";

const config = getConfig();

const isProd = config.NODE_ENV === "production";
const level = isProd ? "info" : "debug";

export const logger = pino(
  {
    level,
    base: null,
    browser: { asObject: true },
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
