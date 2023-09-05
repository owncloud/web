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
import { Store } from 'vuex'

export class PasswordPolicyService {
  private readonly capability: PasswordPolicyCapability
  private readonly language: Language
  private policy: PasswordPolicy

  constructor({ store, language }: { store: Store<unknown>; language: Language }) {
    this.capability = get(store, 'getters.capabilities.password_policy', {
      min_characters: 10,
      max_characters: 72,
      min_lower_case_characters: 2,
      min_upper_case_characters: 2,
      min_digits: 2,
      min_special_characters: 2,
      special_characters: '!*?'
    })
    this.language = language
    this.buildPolicy()
  }

  private buildPolicy() {
    const ruleset = {
      atLeastCharacters: new AtLeastCharactersRule({ ...this.language }),
      mustNotBeEmpty: new MustNotBeEmptyRule({ ...this.language }),
      atLeastUppercaseCharacters: new AtLeastUppercaseCharactersRule({ ...this.language }),
      atLeastLowercaseCharacters: new AtLeastLowercaseCharactersRule({ ...this.language }),
      atLeastDigits: new AtLeastDigitsRule({ ...this.language }),
      mustContain: new MustContainRule({ ...this.language }),
      atMostCharacters: new AtMostCharactersRule({ ...this.language })
    }
    const rules = {} as unknown

    if (this.capability.min_characters) {
      rules.atLeastCharacters = { minLength: this.capability.min_characters }
    } else {
      rules.mustNotBeEmpty = {}
    }

    if (this.capability.min_upper_case_characters) {
      rules.atLeastUppercaseCharacters = {
        minLength: this.capability.min_upper_case_characters
      }
    }

    if (this.capability.min_lower_case_characters) {
      rules.atLeastLowercaseCharacters = {
        minLength: this.capability.min_lower_case_characters
      }
    }

    if (this.capability.min_digits) {
      rules.atLeastDigits = { minLength: this.capability.min_digits }
    }

    if (this.capability.min_special_characters) {
      rules.mustContain = {
        minLength: this.capability.min_special_characters,
        characters: this.capability.special_characters
      }
    }

    if (this.capability.max_characters) {
      rules.atMostCharacters = { maxLength: this.capability.max_characters }
    }

    this.policy = new PasswordPolicy(rules, ruleset)
  }

  public getPolicy(): PasswordPolicy {
    return this.policy
  }
}
