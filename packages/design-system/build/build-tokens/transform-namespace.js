export default {
  name: 'transform/ods/namespace',
  type: 'name',
  transformer: function (prop) {
    return ['oc', prop.name].filter(Boolean).join('-')
  }
}
