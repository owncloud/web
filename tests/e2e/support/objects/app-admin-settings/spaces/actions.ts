const spaceNameSelector = `.spaces-table-space-name`

export const getDisplayedSpaces = async (page): Promise<string[]> => {
  const spaces = []
  const result = page.locator(spaceNameSelector)

  const count = await result.count()
  for (let i = 0; i < count; i++) {
    spaces.push(await result.nth(i).getAttribute('data-test-space-name'))
  }

  return spaces
}
