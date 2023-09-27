import { defaultPlugins, mount } from 'web-test-helpers'

import Resource from './OcResource.vue'
import OcButton from '../OcButton/OcButton.vue'

const stubs = {
  'oc-button': OcButton
}
const fileResource = {
  name: 'forest.jpg',
  path: 'nature/forest.jpg',
  thumbnail: 'https://cdn.pixabay.com/photo/2015/09/09/16/05/forest-931706_960_720.jpg',
  type: 'file',
  isFolder: false,
  extension: 'jpg'
}
const folderResource = {
  name: 'Documents',
  path: '',
  type: 'folder',
  isFolder: true
}
const fileResourceWithoutParentFoldername = {
  name: 'example.pdf',
  path: 'example.pdf',
  type: 'file',
  isFolder: false,
  extension: 'pdf'
}

describe('OcResource', () => {
  it("doesn't emit a click if the resource is a folder", () => {
    const wrapper = mount(Resource, {
      props: {
        resource: folderResource,
        targetRoute: {
          name: 'tests-route'
        }
      },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins()]
      }
    })

    wrapper.find('.oc-resource-name').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it("doesn't emit a click if the resource is not clickable", () => {
    const wrapper = mount(Resource, {
      props: {
        resource: fileResource,
        isResourceClickable: false
      },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins()]
      }
    })

    wrapper.find('.oc-resource-name').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('emits a click', async () => {
    const wrapper = mount(Resource, {
      props: {
        resource: fileResource
      },
      global: {
        stubs: { RouterLink: true, ...stubs },
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins()]
      }
    })

    await wrapper.find('.oc-resource-name').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('parent folder component type is link if parent folder given', () => {
    const wrapper = mount(Resource, {
      props: {
        resource: fileResource,
        isPathDisplayed: true,
        parentFolderLink: {}
      },
      global: {
        stubs: { RouterLink: true, ...stubs },
        renderStubDefaultSlot: true,
        plugins: [...defaultPlugins()]
      }
    })

    expect(wrapper.find('.parent-folder').exists()).toBeTruthy()
    expect(wrapper.find('.parent-folder').attributes('style')).toEqual('cursor: pointer;')
  })

  it('parent folder component type is span if parent folder not given', () => {
    const wrapper = mount(Resource, {
      props: {
        resource: fileResource,
        isPathDisplayed: true
      },
      global: {
        stubs
      }
    })

    expect(wrapper.find('.parent-folder').find('a').exists()).toBeFalsy()
    expect(wrapper.find('.parent-folder').attributes('style')).toEqual('cursor: default;')
  })

  it('displays parent folder name default if calculated name is empty', () => {
    const wrapper = mount(Resource, {
      props: {
        resource: fileResourceWithoutParentFoldername,
        isPathDisplayed: true,
        parentFolderName: 'Example parent folder name'
      },
      global: {
        stubs
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('can be used without icon/thumbnail', () => {
    const wrapper = mount(Resource, {
      props: {
        resource: fileResourceWithoutParentFoldername,
        isIconDisplayed: false,
        parentFolderName: 'Example parent folder name'
      },
      global: {
        stubs
      }
    })

    expect(wrapper.find('oc-resource-thumbnail').exists()).toBeFalsy()
    expect(wrapper.find('oc-resource-icon').exists()).toBeFalsy()
  })
})
