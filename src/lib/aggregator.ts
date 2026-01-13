import type { AggregationMetadata, ProductItem } from "../types.js";
import { FeedLoader } from "./feed-loader.js";
import { logger } from "./logger.js";
import { XMLProcessor } from "./xml-processor.js";

export class FeedAggregator {
	private xml: XMLProcessor;
	private loader: FeedLoader;

	constructor(timeout = 15000) {
		this.xml = new XMLProcessor();
		this.loader = new FeedLoader(timeout);
	}

	async aggregate(
		feedsUrl?: string,
		feedsList?: string[],
	): Promise<{
		xml: string;
		metadata: AggregationMetadata;
	}> {
		const startTime = Date.now();

		// Load the list of feed URLs
		const feedUrls = await this.loader.loadFeedUrls(feedsUrl, feedsList);

		if (feedUrls.length === 0) {
			throw new Error("No feed URLs found");
		}

		// Fetch all feeds in parallel
		const results = await Promise.allSettled(
			feedUrls.map((url) => this.processFeed(url)),
		);

		// Collect all items
		const allItems: ProductItem[] = [];
		let successful = 0;
		let failed = 0;

		for (const result of results) {
			if (result.status === "fulfilled") {
				allItems.push(...result.value);
				successful++;
			} else {
				failed++;
			}
		}

		// Build the final XML
		const xml = this.xml.build(allItems);

		const metadata: AggregationMetadata = {
			totalItems: allItems.length,
			totalFeeds: feedUrls.length,
			successfulFeeds: successful,
			failedFeeds: failed,
			timestamp: new Date().toISOString(),
			duration: Date.now() - startTime,
		};

		return { xml, metadata };
	}

	private async processFeed(url: string): Promise<ProductItem[]> {
		try {
			const content = await this.loader.fetch(url);
			const items = this.xml.parse(content);
			return items;
		} catch (error) {
			logger.error({ err: error, url }, "Feed processing error");
			throw error;
		}
	}
}
