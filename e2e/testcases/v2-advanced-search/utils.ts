export function formatDateToLongString(dateStr: string) {
  const date = new Date(dateStr)
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)

  return formatted
}
