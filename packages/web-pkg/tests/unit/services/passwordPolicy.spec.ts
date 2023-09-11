import { PasswordPolicyService } from '../../../src/services'
import { createStore, defaultStoreMockOptions } from 'web-test-helpers'
import { Language } from 'vue3-gettext'
import { PasswordPolicyCapability } from 'web-client/src/ocs/capabilities'

describe('PasswordPolicyService', () => {
  describe('policy', () => {
    describe('contains the rules according to the capability', () => {
      it.each([
        [{} as PasswordPolicyCapability, ['mustNotBeEmpty']],
        [{ min_characters: 2 } as PasswordPolicyCapability, ['atLeastCharacters']],
        [
          { min_lower_case_characters: 2 } as PasswordPolicyCapability,
          ['atLeastLowercaseCharacters']
        ],
        [
          { min_upper_case_characters: 2 } as PasswordPolicyCapability,
          ['atLeastUppercaseCharacters']
        ],
        [{ min_digits: 2 } as PasswordPolicyCapability, ['atLeastDigits']],
        [{ min_digits: 2 } as PasswordPolicyCapability, ['atLeastDigits']],
        [{ min_special_characters: 2 } as PasswordPolicyCapability, ['mustContain']],
        [
          { max_characters: 72 } as PasswordPolicyCapability,
          ['mustNotBeEmpty', 'atMostCharacters']
        ],
        [
          {
            min_characters: 2,
            min_lower_case_characters: 2,
            min_upper_case_characters: 2,
            min_digits: 2,
            min_special_characters: 2,
            max_characters: 72
          } as PasswordPolicyCapability,
          [
            'atLeastCharacters',
            'atLeastUppercaseCharacters',
            'atLeastLowercaseCharacters',
            'atLeastDigits',
            'mustContain',
            'atMostCharacters'
          ]
        ]
      ])('capability "%s"', (capability: PasswordPolicyCapability, expected: Array<string>) => {
        const { passwordPolicyService } = getWrapper(capability)
        expect(Object.keys((passwordPolicyService.getPolicy() as any).rules)).toEqual(expected)
      })
    })
  })
})

const getWrapper = (capability: PasswordPolicyCapability) => {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockReturnValue({
    password_policy: capability
  })
  const store = createStore(storeOptions)
  return {
    passwordPolicyService: new PasswordPolicyService({
      store,
      language: { current: 'en' } as Language
    })
  }
}
