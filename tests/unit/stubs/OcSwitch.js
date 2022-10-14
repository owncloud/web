export default (vue) => {
  return vue.component('OcSwitch', {
    model: { prop: 'value', event: 'change' },
    template: '<input type="checkbox" />'
  })
}
