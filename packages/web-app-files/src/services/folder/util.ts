export const fetchResources = async (client, path, properties) => {
  try {
    return await client.files.list(path, 1, properties)
  } catch (error) {
    console.error(error)
  }
}
