export const getActionMixinMocks = ({
  actions,
  enabledActions = [],
  additionalActions = undefined
}: {
  actions: string[]
  enabledActions?: string[]
  additionalActions?: { [key: string]: any }
}) => {
  let mocks = {}
  if (additionalActions) {
    mocks = { ...additionalActions }
  }
  for (const action of actions) {
    const isEnabled = !!enabledActions.includes(action)
    mocks[action] = [{ isEnabled: () => isEnabled, name: '', items: [] }]
  }
  return mocks
}
