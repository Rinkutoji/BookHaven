// client/src/lib/debounce.js
// Tiny debounce — delays fn execution until user stops typing

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}