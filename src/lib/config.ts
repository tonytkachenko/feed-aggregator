import { env } from "node:process";
import { z } from "zod";

const envSchema = z.object({
	REQUEST_TIMEOUT_MS: z.coerce.number().default(15000),
	NODE_ENV: z.enum(["development", "production"]).default("production"),
	PORT: z.coerce.number().default(3000),
	LOGS_ACCESS_KEY: z.string().min(1),
});

export type Config = z.infer<typeof envSchema>;

export function getConfig(): Config {
	const parsed = envSchema.safeParse(env);

	if (!parsed.success) {
		throw new Error(`Config validation failed: ${parsed.error.message}`);
	}

	return parsed.data;
}
