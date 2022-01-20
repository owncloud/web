export function arrayBuffToB64(arrayBuffer) {
  return Buffer.from(arrayBuffer).toString('base64')
}
