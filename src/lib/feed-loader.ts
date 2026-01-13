export class FeedLoader {
	private timeout: number;

	constructor(timeout = 15000) {
		this.timeout = timeout;
	}

	parseUrls(content: string): string[] {
		return content
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.filter((line) => !line.startsWith("#"))
			.filter(
				(line) => line.startsWith("http://") || line.startsWith("https://"),
			);
	}

	async fetch(url: string): Promise<string> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					"User-Agent": "FeedAggregator/1.0",
					Accept: "application/xml, text/xml, text/plain",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			return await response.text();
		} finally {
			clearTimeout(timeoutId);
		}
	}

	async loadFeedUrls(
		feedsUrl?: string,
		feedsList?: string[],
	): Promise<string[]> {
		if (feedsList && feedsList.length > 0) {
			return feedsList;
		}

		if (feedsUrl) {
			const content = await this.fetch(feedsUrl);
			return this.parseUrls(content);
		}

		throw new Error("No feeds provided");
	}
}
