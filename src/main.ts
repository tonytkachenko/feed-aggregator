import { serve } from "@hono/node-server";

import app from "./index.js";
import { getConfig, logger } from "./lib/index.js";

const config = getConfig();
const port = config.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    logger.info({ port }, "Node server started");
  },
);
