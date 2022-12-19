import { shallowMount } from 'web-test-helpers'
import { AVAILABLE_SIZES } from '../../helpers/constants'
import { OcResourceIcon } from '..'

const resources = ['file', 'folder', 'space']

describe('OcResourceIcon', () => {
  resources.forEach((resourceType) => {
    AVAILABLE_SIZES.forEach((size) => {
      it(`renders OcIcon for resource type ${resourceType} in size ${size}`, () => {
        const { wrapper } = getWrapper({ resourceType, size })
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
  })
})

function getWrapper(props) {
  return {
    wrapper: shallowMount(OcResourceIcon as any, {
      props: {
        resource: { type: props.resourceType },
        size: props.size
      }
    })
  }
}
