import { Language } from 'vue3-gettext'
import {
  AtLeastCharactersRule,
  AtLeastDigitsRule,
  AtLeastLowercaseCharactersRule,
  AtLeastUppercaseCharactersRule,
  AtMostCharactersRule,
  MustContainRule
} from './rules'
import { PasswordPolicyCapability } from 'web-client/src/ocs/capabilities'
import { PasswordPolicy } from 'password-sheriff'
import get from 'lodash-es/get'

export class PasswordPolicyService {
  private readonly capability: PasswordPolicyCapability
  private readonly language: Language
  private policies = []

  constructor({ store, language }) {
    this.capability = get(store, 'getters.capabilities.password_policy', {
      min_characters: 8,
      min_lower_case_characters: 2,
      min_upper_case_characters: 2,
      min_digits: 1,
      min_special_characters: 2,
      special_characters: '!#?§'
    })
    this.language = language
    this.buildPolicies()
  }

  private buildPolicies() {
    if (!Object.keys(this.capability)) {
      return
    }

    if (this.capability.min_characters) {
      this.policies.push(
        new PasswordPolicy(
          { atLeastCharacters: { minLength: this.capability.min_characters } },
          { atLeastCharacters: new AtLeastCharactersRule({ ...this.language }) }
        )
      )
    }

    if (this.capability.min_upper_case_characters) {
      this.policies.push(
        new PasswordPolicy(
          {
            atLeastUppercaseCharacters: {
              minLength: this.capability.min_upper_case_characters
            }
          },
          { atLeastUppercaseCharacters: new AtLeastUppercaseCharactersRule({ ...this.language }) }
        )
      )
    }

    if (this.capability.min_lower_case_characters) {
      this.policies.push(
        new PasswordPolicy(
          {
            atLeastLowercaseCharacters: {
              minLength: this.capability.min_lower_case_characters
            }
          },
          { atLeastLowercaseCharacters: new AtLeastLowercaseCharactersRule({ ...this.language }) }
        )
      )
    }

    if (this.capability.min_digits) {
      this.policies.push(
        new PasswordPolicy(
          { atLeastDigits: { minLength: this.capability.min_digits } },
          { atLeastDigits: new AtLeastDigitsRule({ ...this.language }) }
        )
      )
    }

    if (this.capability.min_special_characters) {
      this.policies.push(
        new PasswordPolicy(
          {
            mustContain: {
              minLength: this.capability.min_special_characters,
              characters: this.capability.special_characters
            }
          },
          { mustContain: new MustContainRule({ ...this.language }) }
        )
      )
    }

    this.policies.push(
      new PasswordPolicy(
        { atMostCharacters: { maxLength: 72 } },
        { atMostCharacters: new AtMostCharactersRule({ ...this.language }) }
      )
    )
  }

  public getPolicies() {
    return this.policies
  }
}
