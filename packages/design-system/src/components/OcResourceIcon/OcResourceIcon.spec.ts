import { shallowMount } from '@vue/test-utils'

import { AVAILABLE_SIZES } from '../../helpers/constants'
import { OcResourceIcon } from '..'

const resources = ['file', 'folder', 'space']

function getWrapper(props) {
  return shallowMount(OcResourceIcon, {
    propsData: {
      resource: { type: props.resourceType },
      size: props.size
    }
  })
}

describe('OcResourceIcon', () => {
  resources.forEach((resourceType) => {
    AVAILABLE_SIZES.forEach((size) => {
      it(`renders OcIcon for resource type ${resourceType} in size ${size}`, () => {
        const wrapper = getWrapper({ resourceType, size })
        expect(wrapper).toMatchSnapshot()
      })
    })
  })
})
