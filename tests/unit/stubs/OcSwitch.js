export default (vue) => {
  return vue.component('oc-switch', {
    model: { prop: 'value', event: 'change' },
    template: '<input type="checkbox" />'
  })
}
