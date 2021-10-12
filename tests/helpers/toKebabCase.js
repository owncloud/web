export default function (string) {
  return string.replace(/(?![A-Z])([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}
