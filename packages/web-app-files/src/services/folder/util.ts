export const fetchResources = async (client, path, properties, signal = null) => {
  const options = signal ? { signal } : {}
  try {
    return await client.files.list(path, 1, properties, options)
  } catch (error) {
    if (error.name === 'CanceledError') {
      throw error
    }
    console.error(error)
  }
}
