import resources from '@files/src/mixins/resources.js'
import { shallowMount } from '@vue/test-utils'

describe('resources', () => {
  describe('getResourcesSize', () => {
    const wrapper = getWrapper()

    it('should return empty string if size is less than zero', () => {
      expect(wrapper.vm.getResourceSize(-1)).toEqual('')
    })

    it('should return "?" if size is not a number', () => {
      expect(wrapper.vm.getResourceSize('string')).toEqual('?')
    })

    it.each([
      { size: '0', expectedSize: '0 B' },
      { size: '1', expectedSize: '1 B' },
      { size: '1024', expectedSize: '1 kB' },
      { size: '1048576', expectedSize: '1 MB' }
    ])('should return formatted size of given resource', (sizeInput) => {
      expect(wrapper.vm.getResourceSize(sizeInput.size)).toEqual(sizeInput.expectedSize)
    })

    it('should not show round value for size less than a MB', () => {
      expect(wrapper.vm.getResourceSize('4321')).toEqual('4 kB')
    })

    it('should show single round value for size larger than a MB', () => {
      expect(wrapper.vm.getResourceSize('4321000')).toEqual('4.3 MB')
    })
  })
})

function getWrapper() {
  const Component = {
    render() {}
  }
  return shallowMount(Component, {
    mixins: [resources]
  })
}
