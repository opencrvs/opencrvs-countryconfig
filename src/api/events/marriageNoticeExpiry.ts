import { addDays, format, isValid, parseISO } from 'date-fns'

const EXPIRY_DAYS = 90

export function calculateMarriageNoticeExpiryDate(
  dateOfNoticeLodgement: unknown
): string | undefined {
  if (typeof dateOfNoticeLodgement !== 'string') {
    return undefined
  }

  const lodgementDate = parseISO(dateOfNoticeLodgement)
  if (!isValid(lodgementDate)) {
    return undefined
  }

  return format(addDays(lodgementDate, EXPIRY_DAYS), 'yyyy-MM-dd')
}
