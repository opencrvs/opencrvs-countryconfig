export const isValidLuhn = (input: string) => {
  const sanitizedInput = input.replace(/\D/g, '') // Remove non-digit characters
  let sum = 0
  let isOdd = false

  for (let i = sanitizedInput.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedInput[i], 10)
    if (isOdd) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
    isOdd = !isOdd
  }

  return sum % 10 === 0
}
