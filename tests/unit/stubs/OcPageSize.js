export default (vue) => {
  return vue.component('oc-page-size', {
    model: { prop: 'value', event: 'input' },
    template: `<select name="size">
      <option value="100">100</option>
      <option value="500">500</option>
      <option value="1000">1000</option>
      <option value="all">All</option>
    </select>`
  })
}
