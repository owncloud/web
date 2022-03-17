import { unref } from '@vue/composition-api'
import { createWrapper } from './spec'
import { useCapability } from '../../../../src/composables/capability/useCapability'
import { Store } from 'vuex'
import user from '../../../../src/store/user'
import set from 'lodash-es/set'

let store
beforeEach(() => {
  createWrapper(undefined)
  store = new Store({
    modules: {
      user
    }
  })
})

const commitValue = <T>(name: string, value: T) => {
  store.commit('SET_CAPABILITIES', {
    version: '1.2.3',
    capabilities: set({}, name, value)
  })
}

describe('useCapability', () => {
  it('should be valid', () => {
    expect(useCapability).toBeDefined()
  })

  it('handles bools correctly', () => {
    const resharingCapability = useCapability<boolean>(store, 'files_sharing.resharing')
    const resharingCapabilityWithDefault = useCapability<boolean>(
      store,
      'files_sharing.resharing',
      true
    )

    // FIXME: how to test this?
    // expect(() => {
    //     unref(resharingCapability)
    // }).rejects.toThrow()
    expect(unref(resharingCapabilityWithDefault)).toBe(true)

    commitValue('files_sharing.resharing', false)
    expect(unref(resharingCapability)).toBe(false)
    expect(unref(resharingCapabilityWithDefault)).toBe(false)

    commitValue('files_sharing.resharing', true)
    expect(unref(resharingCapability)).toBe(true)
    expect(unref(resharingCapabilityWithDefault)).toBe(true)
  })

  it('handles arrays correctly', () => {
    const supportedTypesCapability = useCapability<string[]>(store, 'checksums.supportedTypes')
    const supportedTypesCapabilityWithDefaults = useCapability<string[]>(
      store,
      'checksums.supportedTypes',
      ['foo', 'bar']
    )

    // FIXME: how to test this?
    // expect(() => {
    //     unref(resharingCapability)
    // }).rejects.toThrow()
    expect(unref(supportedTypesCapabilityWithDefaults)).toStrictEqual(['foo', 'bar'])

    commitValue('checksums.supportedTypes', ['sha1', 'md5', 'adler32'])
    expect(unref(supportedTypesCapability)).toStrictEqual(['sha1', 'md5', 'adler32'])

    commitValue('checksums.supportedTypes', ['sha1', 'adler32'])
    expect(unref(supportedTypesCapability)).toStrictEqual(['sha1', 'adler32'])
  })
})
