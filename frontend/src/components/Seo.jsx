import { useEffect } from "react";
import { siteConfig } from "../config/siteConfig";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function Seo({ title, description, path = "/" }) {
  useEffect(() => {
    const fullTitle = `${title} | ${siteConfig.name}`;
    const url = `https://thamizara.com${path}`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", siteConfig.name);
    setMeta("property", "og:url", url);
    setCanonical(url);
  }, [title, description, path]);
  return null;
}
