import { PasswordPolicyService } from '../../../src/services'
import { createTestingPinia } from 'web-test-helpers'
import { Language } from 'vue3-gettext'
import { PasswordPolicyCapability } from '@ownclouders/web-client/ocs'
import { useCapabilityStore } from '../../../src/composables/piniaStores'
import { describe } from 'vitest'

describe('PasswordPolicyService', () => {
  describe('policy', () => {
    describe('mustNotBeEmpty rule', () => {
      it('is present when "enforcePassword" is set', () => {
        {
          const { passwordPolicyService, store } = getWrapper({} as PasswordPolicyCapability)
          passwordPolicyService.initialize(store)
          expect(
            Object.keys(passwordPolicyService.getPolicy({ enforcePassword: true }).rules)
          ).toEqual(['mustNotBeEmpty'])
        }
      })
      it('is not present when "enforcePassword" is set but other rules apply', () => {
        {
          const { passwordPolicyService, store } = getWrapper({
            min_characters: 2
          } as PasswordPolicyCapability)
          passwordPolicyService.initialize(store)
          expect(
            Object.keys(passwordPolicyService.getPolicy({ enforcePassword: true }).rules)
          ).toEqual(['atLeastCharacters'])
        }
      })
      it('is not present when "enforcePassword" is not set', () => {
        {
          const { passwordPolicyService, store } = getWrapper({} as PasswordPolicyCapability)
          passwordPolicyService.initialize(store)
          expect(Object.keys(passwordPolicyService.getPolicy({}).rules)).toEqual([])
        }
      })
    })
    describe('contains the rules according to the capability', () => {
      it.each([
        [{ min_characters: 2 } as PasswordPolicyCapability, ['atLeastCharacters']],
        [
          { min_lowercase_characters: 2 } as PasswordPolicyCapability,
          ['atLeastLowercaseCharacters']
        ],
        [
          { min_uppercase_characters: 2 } as PasswordPolicyCapability,
          ['atLeastUppercaseCharacters']
        ],
        [{ min_digits: 2 } as PasswordPolicyCapability, ['atLeastDigits']],
        [{ min_digits: 2 } as PasswordPolicyCapability, ['atLeastDigits']],
        [{ min_special_characters: 2 } as PasswordPolicyCapability, ['mustContain']],
        [
          {
            min_characters: 2,
            min_lowercase_characters: 2,
            min_uppercase_characters: 2,
            min_digits: 2,
            min_special_characters: 2
          } as PasswordPolicyCapability,
          [
            'atLeastCharacters',
            'atLeastUppercaseCharacters',
            'atLeastLowercaseCharacters',
            'atLeastDigits',
            'mustContain'
          ]
        ]
      ])('capability "%s"', (capability: PasswordPolicyCapability, expected: Array<string>) => {
        const { passwordPolicyService, store } = getWrapper(capability)
        passwordPolicyService.initialize(store)
        expect(Object.keys(passwordPolicyService.getPolicy().rules)).toEqual(expected)
      })
    })
    describe('method "check"', () => {
      describe('test the password correctly against te defined rules', () => {
        it.each([
          [{} as PasswordPolicyCapability, ['', 'o'], true, [false, true]],
          [{} as PasswordPolicyCapability, ['', 'o'], false, [true, true]],
          [
            { min_characters: 2 } as PasswordPolicyCapability,
            ['', 'o', 'ow', 'ownCloud'],
            false,
            [false, false, true, true]
          ],
          [
            { min_lowercase_characters: 2 } as PasswordPolicyCapability,
            ['', 'o', 'oWNCLOUD', 'ownCloud'],
            false,
            [false, false, false, true]
          ],
          [
            { min_uppercase_characters: 2 } as PasswordPolicyCapability,
            ['', 'o', 'ownCloud', 'ownCLoud'],
            false,
            [false, false, false, true]
          ],
          [
            { min_digits: 2 } as PasswordPolicyCapability,
            ['', '1', 'ownCloud1', 'ownCloud12'],
            false,
            [false, false, false, true]
          ],
          [
            { min_special_characters: 2 } as PasswordPolicyCapability,
            ['', '!', 'ownCloud!', 'ownCloud!#'],
            false,
            [false, false, false, true]
          ],
          [
            {
              min_characters: 8,
              min_lowercase_characters: 2,
              min_uppercase_characters: 2,
              min_digits: 2,
              min_special_characters: 2,
              max_characters: 72
            } as PasswordPolicyCapability,
            ['öwnCloud', 'öwnCloudää', 'öwnCloudää12', 'öwnCloudäÄ12#!'],
            false,
            [false, false, false, true]
          ]
        ])(
          'capability "%s, passwords "%s"',
          (
            capability: PasswordPolicyCapability,
            passwords: Array<string>,
            enforcePassword: boolean,
            expected: Array<boolean>
          ) => {
            const { passwordPolicyService, store } = getWrapper(capability)
            passwordPolicyService.initialize(store)
            const policy = passwordPolicyService.getPolicy({ enforcePassword })
            for (let i = 0; i < passwords.length; i++) {
              expect(policy.check(passwords[i])).toEqual(expected[i])
            }
          }
        )
      })
    })
  })
})

const getWrapper = (capability: PasswordPolicyCapability) => {
  createTestingPinia()
  const store = useCapabilityStore()
  store.capabilities.password_policy = capability

  return {
    store,
    passwordPolicyService: new PasswordPolicyService({
      language: { current: 'en' } as Language
    })
  }
}
