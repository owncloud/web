import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import AutocompleteItem from '../../../../../../src/components/SideBar/Shares/InviteCollaborator/AutocompleteItem.vue'
import stubs from '../../../../../../../../tests/unit/stubs'
import { ShareTypes } from '../../../../../../src/helpers/share'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('AutocompleteItem component', () => {
  it.each(ShareTypes.all)('sets a class that reflects the share type', (shareType) => {
    const wrapper = createWrapper({ shareType: shareType.value })
    expect(wrapper.find('div').classes()).toContain(`files-collaborators-search-${shareType.key}`)
  })
  describe('displays the correct image/icon according to the shareType', () => {
    it('should display users avatar for user shares', () => {
      const wrapper = createWrapper({ shareType: 0 })
      expect(wrapper.find('avatar-image-stub').exists()).toBeTruthy()
      expect(wrapper.find('oc-icon-stub').exists()).toBeFalsy()
    })
    it('should display a group icon for group shares', () => {
      const wrapper = createWrapper({ shareType: 1 })
      expect(wrapper.find('avatar-image-stub').exists()).toBeFalsy()
      expect(wrapper.find('oc-icon-stub').exists()).toBeTruthy()
      expect(wrapper.find('oc-icon-stub').attributes().name).toEqual('group')
      expect(wrapper.find('oc-icon-stub').rootNode.key).toEqual('avatar-group')
    })
    it.each([3, 4, 6])(
      'should display a generic-person icon for any other share types',
      (shareType) => {
        const wrapper = createWrapper({ shareType: shareType })
        expect(wrapper.find('avatar-image-stub').exists()).toBeFalsy()
        expect(wrapper.find('oc-icon-stub').exists()).toBeTruthy()
        expect(wrapper.find('oc-icon-stub').attributes().name).toEqual('person')
        expect(wrapper.find('oc-icon-stub').rootNode.key).toEqual('avatar-generic-person')
      }
    )
  })
  describe('avatar image', () => {
    it('sets the userId', () => {
      const wrapper = createWrapper({ shareType: 0, shareWith: 'the-user-id' })
      expect(wrapper.find('avatar-image-stub').attributes('userid')).toEqual('the-user-id')
    })
    it('sets the user-name', () => {
      const wrapper = createWrapper({ shareType: 0, label: 'the-user-name' })
      expect(wrapper.find('avatar-image-stub').attributes('user-name')).toEqual('the-user-name')
    })
  })
  describe('autocomplete text', () => {
    it('shows the user name', () => {
      const wrapper = createWrapper({ label: 'Alice Hansen' })
      expect(wrapper.find('.files-collaborators-autocomplete-username').text()).toEqual(
        'Alice Hansen'
      )
    })
    it('shows additional information when set', () => {
      const wrapper = createWrapper({ shareWithAdditionalInfo: 'some text' })
      expect(wrapper.find('.files-collaborators-autocomplete-additional-info').text()).toEqual(
        '(some text)'
      )
    })
    it('does not show additional information when not set', () => {
      const wrapper = createWrapper({ shareWithAdditionalInfo: undefined })
      expect(wrapper.find('.files-collaborators-autocomplete-additional-info').exists()).toBeFalsy()
    })
    it('shows the share type', () => {
      const wrapper = createWrapper({ shareType: 0 })
      expect(wrapper.find('.files-collaborators-autocomplete-share-type').text()).toEqual('User')
    })
  })
})

function createWrapper({
  shareType = ShareTypes.user.value,
  shareWithAdditionalInfo,
  shareWith,
  label
}) {
  return shallowMount(AutocompleteItem, {
    store: new Vuex.Store({}),
    propsData: {
      item: {
        value: {
          shareType,
          shareWith,
          shareWithAdditionalInfo
        },
        label
      }
    },
    localVue,
    stubs: stubs
  })
}
