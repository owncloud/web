/**
 * Adds a given number of days to the current date
 * @param {number} days number of days to be added to the current date
 * @returns date in the future with added days
 */
export function getDateInFuture(days) {
  const date = new Date()

  date.setDate(new Date().getDate() + days)

  return date
}
