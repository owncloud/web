let num = 0

export default function uniqueId(prefix: string = '') {
  prefix = prefix || ''
  num += 1
  return prefix + num
}
