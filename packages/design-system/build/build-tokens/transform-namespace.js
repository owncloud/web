module.exports = {
  name: 'transform/ods/namespace',
  type: 'name',
  transformer: function (prop) {
    return ['oc', prop.filePath.split('/').some((n) => n === 'docs') ? 'docs' : '', prop.name]
      .filter(Boolean)
      .join('-')
  }
}
