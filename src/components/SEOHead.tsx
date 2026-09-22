import { useEffect } from "react";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = "Auto Imports from Japan | Direct Japanese Used Car Exporter - Neo Trading";
const DEFAULT_DESCRIPTION =
  "Neo Trading is your premier partner for auto imports from Japan. Direct access to 150+ Japanese auto auctions, verified inspection sheets, transparent FOB/CIF pricing, and worldwide shipping.";
const DEFAULT_KEYWORDS =
  "auto imports from japan, import cars from japan, japanese auto exporter, JDM imports, japanese used cars, buy cars from japan auction, direct car import japan, JDM sports cars, Kei trucks";
const BASE_URL = "https://neojapancars.com";
const DEFAULT_IMAGE = "https://neojapancars.com/og-image.jpg";

function setMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonicalUrl(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  jsonLd,
}: SEOHeadProps) => {
  useEffect(() => {
    const fullTitle = title
      ? title.includes("Neo")
        ? title
        : `${title} | Neo - Auto Imports from Japan`
      : DEFAULT_TITLE;

    document.title = fullTitle;

    setMetaTag("description", description, "name");
    setMetaTag("keywords", keywords, "name");

    const resolvedCanonical = canonicalUrl
      ? canonicalUrl.startsWith("http")
        ? canonicalUrl
        : `${BASE_URL}${canonicalUrl.startsWith("/") ? "" : "/"}${canonicalUrl}`
      : `${BASE_URL}${window.location.pathname}`;

    setCanonicalUrl(resolvedCanonical);

    // OpenGraph
    setMetaTag("og:title", fullTitle, "property");
    setMetaTag("og:description", description, "property");
    setMetaTag("og:type", ogType, "property");
    setMetaTag("og:url", resolvedCanonical, "property");
    setMetaTag("og:image", ogImage, "property");
    setMetaTag("og:site_name", "Neo Trading - Auto Imports from Japan", "property");

    // Twitter
    setMetaTag("twitter:card", "summary_large_image", "name");
    setMetaTag("twitter:title", fullTitle, "name");
    setMetaTag("twitter:description", description, "name");
    setMetaTag("twitter:image", ogImage, "name");

    // Dynamic JSON-LD injection
    const scriptId = "dynamic-json-ld";
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, jsonLd]);

  return null;
};

export default SEOHead;
