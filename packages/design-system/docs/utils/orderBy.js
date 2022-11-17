// Native
const sortBy = (key) => {
  return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0)
}

function orderBy(collection, property) {
  if (collection == null) {
    return []
  }
  collection = Object.values(collection)
  return collection.concat().sort(sortBy(property))
}

module.exports = orderBy
