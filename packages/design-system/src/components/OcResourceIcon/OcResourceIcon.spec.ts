import { shallowMount } from 'web-test-helpers'
import { AVAILABLE_SIZES } from '../../helpers/constants'
import { OcResourceIcon } from '..'
import { OcResourceIconMapping, ocResourceIconMappingInjectionKey } from './types'
import { Resource } from 'web-client'

const resources: Resource[] = [
  {
    type: 'file'
  },
  {
    type: 'file',
    extension: 'not-a-real-extension'
  },
  {
    type: 'folder'
  },
  {
    type: 'space'
  }
].map((r) => {
  return { ...r, id: null, path: null }
})

const resourceIconMapping: OcResourceIconMapping = {
  extension: {
    'not-a-real-extension': {
      name: 'not-real',
      color: 'red'
    }
  },
  mimeType: {}
}

describe('OcResourceIcon', () => {
  resources.forEach((resource) => {
    AVAILABLE_SIZES.forEach((size) => {
      it(`renders OcIcon for resource type ${resource.type}${
        resource.extension ? ` (${resource.extension})` : ''
      } in size ${size}`, () => {
        const { wrapper } = getWrapper({ resource, size })
        expect(wrapper.html()).toMatchSnapshot()
      })
    })
  })
})

function getWrapper({ resource, size }: { resource: Resource; size: string }) {
  return {
    wrapper: shallowMount(OcResourceIcon as any, {
      global: {
        provide: {
          [ocResourceIconMappingInjectionKey]: resourceIconMapping
        }
      },
      props: {
        resource,
        size
      }
    })
  }
}
