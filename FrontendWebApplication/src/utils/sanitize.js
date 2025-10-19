"use strict";

/**
 * PUBLIC_INTERFACE
 * sanitizeHtml and SafeHtml provide a centralized way to safely render HTML content.
 * This avoids direct usage of dangerouslySetInnerHTML across the app.
 * We implement a small, dependency-free sanitizer that strips script/style/iframe and
 * unsafe attributes. For complex needs, consider integrating DOMPurify.
 */

// PUBLIC_INTERFACE
export function sanitizeHtml(html) {
  /** Returns a sanitized HTML string by removing script/style/iframe and unsafe attrs. */
  if (!html || typeof html !== "string") return "";
  // Create a DOM parser environment only in browser
  if (typeof window === "undefined" || !window.DOMParser) {
    // Server or test environments: return a basic escaped string fallback
    const escaped = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped;
  }

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove potentially dangerous elements
  const blockedTags = ["script", "style", "iframe", "object", "embed", "link", "meta"];
  blockedTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  // Remove event handler attributes and javascript: urls
  const treeWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
  while (treeWalker.nextNode()) {
    const el = treeWalker.currentNode;
    // Clone attributes to iterate safely
    Array.from(el.attributes || []).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || "");
      // Strip on* handlers or javascript: URIs
      if (name.startsWith("on") || /^javascript:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
      // Optionally restrict target=_blank unless rel set
      if (name === "target" && value === "_blank") {
        el.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  return doc.body.innerHTML || "";
}

// PUBLIC_INTERFACE
export function SafeHtml({ html, as = "div", ...rest }) {
  /**
   * React component that renders sanitized HTML into a chosen element.
   * Props:
   * - html: string (raw HTML to render)
   * - as: string tag name (default 'div')
   * - ...rest: any other props to pass to the element
   */
  const Tag = as;
  const clean = sanitizeHtml(html);
  // eslint-disable-next-line react/no-danger
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: clean }} />;
}
