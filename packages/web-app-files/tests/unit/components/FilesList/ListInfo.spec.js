import ListInfo from '../../../../src/components/FilesList/ListInfo.vue'
import GetTextPlugin from 'vue-gettext'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
describe('ListInfo', () => {
  describe('files and folders prop', () => {
    const wrapper = getWrapper()
    const itemElement = wrapper.find('p')

    it('should set data test attributes', () => {
      expect(itemElement.attributes('data-test-items')).toBe('5')
      expect(itemElement.attributes('data-test-files')).toBe('2')
      expect(itemElement.attributes('data-test-folders')).toBe('3')
    })

    it('should show text with files and folders total and individual count', () => {
      expect(itemElement.text()).toBe('5 items in total (2 files, 3 folders)')
    })

    describe('item noun used inside information text', () => {
      it.each([
        {
          prop: { files: -1, folders: -1 },
          expectedText: '-2 items in total (-1 files, -1 folders)'
        },
        {
          prop: { files: 0.1, folders: 0.1 },
          expectedText: '0.2 items in total (0.1 files, 0.1 folders)'
        },
        { prop: { files: 0, folders: 0 }, expectedText: '0 items in total (0 files, 0 folders)' },
        { prop: { files: 0, folders: 1 }, expectedText: '1 item in total (0 files, 1 folder)' },
        { prop: { files: 1, folders: 0 }, expectedText: '1 item in total (1 file, 0 folders)' },
        { prop: { files: 1, folders: 1 }, expectedText: '2 items in total (1 file, 1 folder)' },
        { prop: { files: 2, folders: 2 }, expectedText: '4 items in total (2 files, 2 folders)' }
      ])('should be singular or plural according to item, files and folders count', (cases) => {
        const wrapper = getWrapper(cases.prop)
        const itemElement = wrapper.find('p')
        expect(itemElement.text()).toBe(cases.expectedText)
      })
    })
  })
  describe('size prop', () => {
    it('should not set the size attribute if not provided', () => {
      const wrapper = getWrapper()
      const itemElement = wrapper.find('p')

      expect(itemElement.attributes('data-test-size')).toBe(undefined)
    })
    it.each([-1, 0, 1, 0.1, 100000.01])(
      'should set data test size property if provided',
      (size) => {
        const wrapper = getWrapper({ size: size })

        expect(wrapper.find('p').attributes('data-test-size')).toBe(size.toString())
      }
    )

    describe('when size prop is zero or smaller', () => {
      it.each([0, -1])('should not contain size information inside text', (size) => {
        const wrapper = getWrapper({ size: size })
        const itemElement = wrapper.find('p')
        expect(itemElement.text()).toBe('5 items in total (2 files, 3 folders)')
      })
    })
    describe('when size prop is greater than zero', () => {
      it.each`
        size              | expectedSize
        ${0.1}            | ${'0 B'}
        ${1}              | ${'1 B'}
        ${100}            | ${'100 B'}
        ${10000}          | ${'10 kB'}
        ${10000000}       | ${'10 MB'}
        ${10000000000}    | ${'10 GB'}
        ${10000000000000} | ${'10 TB'}
      `('should calculate size units', ({ size, expectedSize }) => {
        const wrapper = getWrapper({ size: size })

        expect(wrapper.find('p').text()).toBe(
          `5 items with ${expectedSize} in total (2 files, 3 folders)`
        )
      })
    })
  })
})

function getWrapper(props = {}) {
  return shallowMount(ListInfo, {
    localVue,
    propsData: {
      files: 2,
      folders: 3,
      ...props
    }
  })
}
