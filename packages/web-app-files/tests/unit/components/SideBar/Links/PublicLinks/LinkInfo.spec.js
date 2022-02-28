import { DateTime } from 'luxon'
import stubs from '@/tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import DesignSystem from 'owncloud-design-system'
import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import LinkInfo from '@files/src/components/SideBar/Links/PublicLinks/LinkInfo.vue'

const selectors = {
  linkName: '.oc-files-file-link-name',
  linkExpirationInfo: '.oc-files-public-link-expires',
  linkPassword: '.oc-files-file-link-password',
  linkIndirect: '.oc-files-file-link-via',
  linkViaLabel: '.files-file-links-link-via-label',
  linkRole: '.oc-files-file-link-role',
  linkCopyUrl: '.oc-files-public-link-copy-url',
  linkUrl: '.oc-files-file-link-url'
}
const localVue = createLocalVue()
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

describe('LinkInfo', () => {
  describe('link name', () => {
    it('should show token as link name if link does not have name', () => {
      const wrapper = getShallowWrapper()

      expect(wrapper.vm.linkName).toEqual('122235445488')
      expect(wrapper.find(selectors.linkName).text()).toEqual('122235445488')
    })

    it('should show link name if provided link has name attribute', () => {
      const wrapper = getShallowWrapper({
        name: 'some-name',
        url: 'some-link'
      })

      expect(wrapper.vm.linkName).toEqual('some-name')
      expect(wrapper.find(selectors.linkName).text()).toEqual('some-name')
    })

    it('should show link name if provided link has both name and token attribute', () => {
      const wrapper = getShallowWrapper({
        name: 'some-name',
        token: 'some-token',
        url: 'some-link'
      })

      expect(wrapper.vm.linkName).toEqual('some-name')
      expect(wrapper.find(selectors.linkName).text()).toEqual('some-name')
    })
  })

  describe('link url', () => {
    it('should set provided link url as href attribute of link tag and as value of copy to clipboard button', () => {
      const wrapper = getShallowWrapper({
        url: 'some-link'
      })
      const linkCopyUrlHyperlink = wrapper.find(selectors.linkUrl)

      expect(wrapper.vm.link.url).toEqual('some-link')
      expect(linkCopyUrlHyperlink.attributes().href).toEqual('some-link')
      expect(linkCopyUrlHyperlink.text()).toEqual('some-link')
    })
  })

  describe('link role', () => {
    it.each([
      { role: 'Viewer', icon: 'eye' },
      { role: 'Editor', icon: 'pencil' },
      { role: 'Contributor', icon: 'pencil' },
      { role: 'Uploader', icon: 'upload' },
      { role: '*', icon: 'key' }
    ])('should set different role tag icon for different role types', (dataSet) => {
      const wrapper = getShallowWrapper({
        url: 'some-link',
        description: dataSet.role
      })

      expect(wrapper.find(`${selectors.linkRole} oc-icon-stub`).attributes().name).toEqual(
        dataSet.icon
      )
      expect(wrapper.find(selectors.linkRole).text()).toEqual(dataSet.role)
    })
  })
  describe('copy to clipboard button', () => {
    const wrapper = getShallowWrapper({
      url: 'some-link'
    })
    const linkCopyUrlButton = wrapper.find(selectors.linkCopyUrl)

    it('should set link url as button value', () => {
      expect(linkCopyUrlButton.attributes().value).toEqual('some-link')
    })

    it('should have label set', () => {
      expect(linkCopyUrlButton.props().label).toBe('Copy link to clipboard')
    })

    it('should have success message title set', () => {
      expect(linkCopyUrlButton.props().successMsgTitle).toBe('Public link copied')
    })

    it('should have success message text set', () => {
      const wrapper = getShallowWrapper({
        url: 'some-link',
        name: 'some name'
      })
      const linkCopyUrlButton = wrapper.find(selectors.linkCopyUrl)

      expect(linkCopyUrlButton.props().successMsgText).toBe(
        'The public link "some name" has been copied to your clipboard.'
      )
    })
  })

  describe('link expiration', () => {
    it('should exist if link has expiration', () => {
      const tomorrow = DateTime.now().plus({ days: 1 })
      const wrapper = getShallowWrapper({
        url: 'some-link',
        expiration: tomorrow
      })

      const linkExpiration = wrapper.find(selectors.linkExpirationInfo)

      expect(linkExpiration.exists()).toBeTruthy()
      expect(linkExpiration.find('translate-stub').props().translateParams).toMatchObject({
        expires: 'in 1 day'
      })
    })
    it('should not be present if link does not have expiration', () => {
      const wrapper = getShallowWrapper({
        url: 'some-link'
      })

      expect(wrapper.find(selectors.linkExpirationInfo).exists()).toBeFalsy()
    })
  })
  describe('link password', () => {
    it('should exist if link has password', () => {
      const wrapper = getShallowWrapper({
        url: 'some-link',
        password: 'some-password'
      })

      expect(wrapper.find(selectors.linkPassword).exists()).toBeTruthy()
    })
    it('should not be present if link does not have password', () => {
      const wrapper = getShallowWrapper({
        url: 'some-link'
      })

      expect(wrapper.find(selectors.linkPassword).exists()).toBeFalsy()
    })
  })
  describe('indirect link', () => {
    it('should exist if link is indirect', () => {
      const wrapper = getMountedWrapper({
        url: 'some-link',
        indirect: true,
        path: '/some-path'
      })
      const linkDirectTag = wrapper.find(selectors.linkIndirect)

      expect(linkDirectTag.exists()).toBeTruthy()
      expect(linkDirectTag.props().to).toMatchObject({
        name: 'files-spaces-personal-home',
        params: { item: '/' },
        query: { scrollTo: 'some-path' }
      })
      expect(linkDirectTag.find(selectors.linkViaLabel).text()).toBe('Via some-path')
    })
    it('should not exist if link is not indirect', () => {
      const wrapper = getShallowWrapper({
        url: 'some-link'
      })

      expect(wrapper.find(selectors.linkIndirect).exists()).toBeFalsy()
    })
  })
})

function getShallowWrapper(
  link = {
    token: '122235445488',
    url: 'some-link'
  }
) {
  return shallowMount(LinkInfo, {
    localVue,
    stubs: { ...stubs, 'oc-tag': true },
    propsData: {
      link: link
    },
    directives: {
      'oc-tooltip': jest.fn()
    }
  })
}

function getMountedWrapper(
  link = {
    token: '122235445488',
    url: 'some-link'
  }
) {
  localVue.use(DesignSystem)
  return mount(LinkInfo, {
    localVue,
    propsData: {
      link: link
    },
    stubs,
    directives: {
      'oc-tooltip': jest.fn()
    }
  })
}
