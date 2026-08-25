// Плавный скролл к нижней границе футера (чтобы были видны низ колонок футера,
// а не только его верхняя кромка).
export function scrollToFooterBottom(): void {
  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}