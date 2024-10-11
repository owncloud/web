export const applyCustomProp = (key: string, value: string | undefined) => {
  if (value === undefined) {
    return
  }
  ;(document.querySelector(':root') as HTMLElement).style.setProperty('--oc-' + key, value)
}
