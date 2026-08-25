let timeout: number | undefined;
export function notify(message: string): void {
  const toast = document.querySelector<HTMLDivElement>('#toast');
  if (!toast) return;
  toast.textContent = message; toast.classList.add('show');
  window.clearTimeout(timeout); timeout = window.setTimeout(() => toast.classList.remove('show'), 4500);
}
