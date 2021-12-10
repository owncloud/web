import userEvent from '@testing-library/user-event'

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

export async function navigateToDate(date, component, direction = 'right') {
  const formatDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  if (['right', 'left'].indexOf(direction) < 0) {
    return Promise.reject(new Error('invalid value for direction. Please use "left" or "right"'))
  }
  const { queryByText, baseElement, findByText } = component

  while (true) {
    const dateHeader = await queryByText(
      date.toLocaleString('en', { month: 'long', year: 'numeric' })
    )

    if (!dateHeader) {
      const nextMonthBtn = baseElement.querySelector(`.vc-arrow.is-${direction}`)
      await userEvent.click(nextMonthBtn)
    } else {
      break
    }
  }

  const dateSelector = document.evaluate(
    `//span[contains(@class, "vc-day-content vc-focusable") and @tabindex="-1" and @aria-label="${date.toLocaleDateString(
      'en',
      formatDate
    )}" and text()="${date.getDate()}"]`,
    baseElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue

  expect(
    await findByText(date.toLocaleString('en', { month: 'long', year: 'numeric' }))
  ).toBeVisible()
  await userEvent.click(dateSelector)
}
