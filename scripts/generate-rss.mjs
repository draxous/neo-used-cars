import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function generateRss() {
  const blogsModule = await import("../src/data/blogs.ts");
  const blogs = blogsModule.blogs;

  const siteUrl = "https://neojapancars.com";
  const now = new Date().toUTCString();

  const itemsXml = blogs
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.isoDate).toUTCString();
      const firstSectionSnippet = post.sections[0]?.content?.[0] || post.description;

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>neollcjp@gmail.com (${post.author.name})</author>
      <category>${post.category}</category>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[
        <p><strong>${post.subtitle}</strong></p>
        <p>${firstSectionSnippet}</p>
        <p><a href="${postUrl}">Read full guide on Neo Trading &rarr;</a></p>
      ]]></content:encoded>
      ${post.image ? `<enclosure url="${post.image}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Auto Imports from Japan | Guides &amp; Market Insights — Neo Trading</title>
    <link>${siteUrl}/blog</link>
    <description>Authoritative guides, auction tips, and regulatory import rules for importing JDM cars, Kei trucks, and sports classics to the US, UK, and worldwide from Japan.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/og-image.jpg</url>
      <title>Auto Imports from Japan — Neo Trading</title>
      <link>${siteUrl}</link>
    </image>
${itemsXml}
  </channel>
</rss>
`;

  const outputPath = path.join(rootDir, "public", "rss.xml");
  fs.writeFileSync(outputPath, rssXml.trim() + "\n", "utf8");
  console.log(`Generated RSS feed with ${blogs.length} articles at: ${outputPath}`);
}

generateRss().catch((err) => {
  console.error("Failed to generate RSS feed:", err);
  process.exit(1);
});
