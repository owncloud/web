import { Language } from 'vue3-gettext'
import {
  AtLeastCharactersRule,
  AtLeastDigitsRule,
  AtLeastLowercaseCharactersRule,
  AtLeastUppercaseCharactersRule,
  AtMostCharactersRule,
  MustContainRule,
  MustNotBeEmptyRule
} from './rules'
import { PasswordPolicyCapability } from 'web-client/src/ocs/capabilities'
import { PasswordPolicy } from 'password-sheriff'
import get from 'lodash-es/get'

export class PasswordPolicyService {
  private readonly capability: PasswordPolicyCapability
  private readonly language: Language
  private policies = []

  constructor({ store, language }) {
    this.capability = get(store, 'getters.capabilities.password_policy', {})
    this.language = language
    this.buildPolicies()
  }

  private buildPolicies() {
    if (this.capability.min_characters) {
      this.policies.push(
        new PasswordPolicy(
          { atLeastCharacters: { minLength: this.capability.min_characters } },
          { atLeastCharacters: new AtLeastCharactersRule({ ...this.language }) }
        )
      )
    } else {
      this.policies.push(
        new PasswordPolicy(
          { mustNotBeEmpty: {} },
          { mustNotBeEmpty: new MustNotBeEmptyRule({ ...this.language }) }
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

    /**
     * Not configurable, backend limitation
     */
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
