import { mount } from '@vue/test-utils'

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
      propsData: {
        resource: folderResource,
        targetRoute: {
          name: 'tests-route'
        }
      }
    })

    wrapper.find('.oc-resource-name').trigger('click')
    expect(wrapper.emitted().click).toBeFalsy()
  })

  it("doesn't emit a click if the resource is not clickable", () => {
    const wrapper = mount(Resource, {
      propsData: {
        resource: fileResource,
        isResourceClickable: false
      }
    })

    wrapper.find('.oc-resource-name').trigger('click')
    expect(wrapper.emitted().click).toBeFalsy()
  })

  it('emits a click', () => {
    const wrapper = mount(Resource, {
      propsData: {
        resource: fileResource
      },
      stubs
    })

    wrapper.find('.oc-resource-name').trigger('click')
    expect(wrapper.emitted().click).toBeTruthy()
  })

  it('parent folder component type is link if parent folder given', () => {
    const wrapper = mount(Resource, {
      propsData: {
        resource: fileResource,
        isPathDisplayed: true,
        parentFolderLink: {}
      },
      stubs
    })

    expect(wrapper.find('.parent-folder').find('a').exists()).toBeTruthy()
    expect(wrapper.find('.parent-folder').attributes('style')).toEqual('cursor: pointer;')
  })

  it('parent folder component type is span if parent folder not given', () => {
    const wrapper = mount(Resource, {
      propsData: {
        resource: fileResource,
        isPathDisplayed: true
      },
      stubs
    })

    expect(wrapper.find('.parent-folder').find('a').exists()).toBeFalsy()
    expect(wrapper.find('.parent-folder').attributes('style')).toEqual('cursor: default;')
  })

  it('displays parent folder name default if calculated name is empty', () => {
    const wrapper = mount(Resource, {
      propsData: {
        resource: fileResourceWithoutParentFoldername,
        isPathDisplayed: true,
        parentFolderNameDefault: 'Example parent folder name'
      },
      stubs
    })

    expect(wrapper).toMatchSnapshot()
  })
})
