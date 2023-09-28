import { unref } from 'vue'
import { useCapability } from '../../../../src/composables/capability/useCapability'
// FIXME:
import user from '../../../../../web-runtime/src/store/user'
import set from 'lodash-es/set'
import { getStoreInstance } from 'web-test-helpers'

const commitValue = <T>(store, name: string, value: T) => {
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
    const store = getStoreInstance({ modules: { user } })

    const hasResharing = useCapability<boolean>(store, 'files_sharing.resharing')
    const hasResharingWithDefault = useCapability<boolean>(store, 'files_sharing.resharing', true)

    // FIXME: how to test this?
    // expect(() => {
    //     unref(hasResharing)
    // }).rejects.toThrow()
    expect(unref(hasResharingWithDefault)).toBe(true)

    commitValue(store, 'files_sharing.resharing', false)
    expect(unref(hasResharing)).toBe(false)
    expect(unref(hasResharingWithDefault)).toBe(false)

    commitValue(store, 'files_sharing.resharing', true)
    expect(unref(hasResharing)).toBe(true)
    expect(unref(hasResharingWithDefault)).toBe(true)
  })

  it('handles arrays correctly', () => {
    const store = getStoreInstance({ modules: { user } })

    const supportedTypesCapability = useCapability<string[]>(store, 'checksums.supportedTypes')
    const supportedTypesCapabilityWithDefaults = useCapability<string[]>(
      store,
      'checksums.supportedTypes',
      ['foo', 'bar']
    )

    // FIXME: how to test this?
    // expect(() => {
    //     unref(hasResharing)
    // }).rejects.toThrow()
    expect(unref(supportedTypesCapabilityWithDefaults)).toStrictEqual(['foo', 'bar'])

    commitValue(store, 'checksums.supportedTypes', ['sha1', 'md5', 'adler32'])
    expect(unref(supportedTypesCapability)).toStrictEqual(['sha1', 'md5', 'adler32'])

    commitValue(store, 'checksums.supportedTypes', ['sha1', 'adler32'])
    expect(unref(supportedTypesCapability)).toStrictEqual(['sha1', 'adler32'])
  })
})
