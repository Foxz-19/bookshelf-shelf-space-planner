// @ts-check

/**
 * Return a required element with a checked runtime type.
 * @template {Element} T
 * @param {string} selector
 * @param {new (...args: any[]) => T} type
 * @returns {T}
 */
export function requiredElement(selector, type) {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Missing required element: ${selector}`);
  return element;
}
