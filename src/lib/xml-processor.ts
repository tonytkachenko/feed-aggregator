import { XMLBuilder, XMLParser } from "fast-xml-parser";

import type { ProductItem } from "../types.js";

export class XMLProcessor {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    // Parser with namespace support (g:price, g:id, etc.)
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseTagValue: false, // Important: do not coerce value types
      trimValues: true,
      removeNSPrefix: false, // Keep g: prefixes
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      format: true,
      suppressEmptyNode: true,
      processEntities: true,
    });
  }

  parse(xmlContent: string): ProductItem[] {
    try {
      const parsed = this.parser.parse(xmlContent);

      const items = parsed?.rss?.channel?.item;

      if (!items) return [];

      return Array.isArray(items) ? items : [items];
    } catch (error) {
      throw new Error(
        `XML parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  build(items: ProductItem[]): string {
    const rss = {
      "?xml": {
        "@_version": "1.0",
        "@_encoding": "UTF-8",
      },
      rss: {
        "@_xmlns:g": "http://base.google.com/ns/1.0",
        "@_version": "2.0",
        channel: {
          title: "Aggregated Feed",
          link: "https://feed-aggregator.app",
          lastBuildDate: new Date().toUTCString(),
          item: items,
        },
      },
    };

    return this.builder.build(rss);
  }
}
