import { getExpirationRules } from '../../../../src/helpers/share'
import { mock } from 'vitest-mock-extended'
import { PublicExpirationCapability } from '@ownclouders/web-client/ocs'
import { createTestingPinia } from 'web-test-helpers'
import { useCapabilityStore } from '../../../../src/composables/piniaStores'

describe('getExpirationRules', () => {
  it('correctly computes rules based on the "expire_date"-capability', () => {
    vi.useFakeTimers().setSystemTime(new Date('2000-01-01'))
    createTestingPinia()
    const capabilityStore = useCapabilityStore()
    const capabilities = mock<PublicExpirationCapability>({ enforced: true, days: '10' })
    capabilityStore.capabilities.files_sharing.public.expire_date = capabilities

    const rules = getExpirationRules({
      currentLanguage: 'de',
      capabilityStore
    })

    expect(rules.enforced).toEqual(capabilities.enforced)
    expect(rules.default).toEqual(new Date('2000-01-11'))
    expect(rules.min).toEqual(new Date('2000-01-01'))
    expect(rules.max).toEqual(new Date('2000-01-11'))
  })
})
