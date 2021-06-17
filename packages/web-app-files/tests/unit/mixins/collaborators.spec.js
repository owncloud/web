import CollaboratorsMixins from '../../../src/mixins/collaborators'
import { shallowMount } from '@vue/test-utils'

describe('mixins/collaborators', () => {
  describe('collaboratorType', () => {
    it.each`
      shareType    | expectedResult
      ${0}         | ${'User'}
      ${1}         | ${'Group'}
      ${2}         | ${'Unknown type'}
      ${3}         | ${'Unknown type'}
      ${4}         | ${'Guest'}
      ${5}         | ${'Unknown type'}
      ${6}         | ${'Remote user'}
      ${7}         | ${'Unknown type'}
      ${'string'}  | ${'Unknown type'}
      ${null}      | ${'Unknown type'}
      ${undefined} | ${'Unknown type'}
      ${'0'}       | ${'Unknown type'}
    `('maps share types correctly to human readable output', ({ shareType, expectedResult }) => {
      const Component = {
        render() {}
      }
      const wrapper = shallowMount(Component, {
        mixins: [CollaboratorsMixins]
      })
      expect(wrapper.vm.collaboratorType(shareType)).toEqual(expectedResult)
    })
  })
})
