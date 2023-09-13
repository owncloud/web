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
import { GeneratePassword } from 'js-generate-password'

interface GeneratePasswordRules {
  length: number
  minLowercaseCharacters: number
  minUppercaseCharacters: number
  minSpecialCharacters: number
  minDigits: number
}

export class PasswordPolicyService {
  private readonly capability: PasswordPolicyCapability
  private readonly language: Language
  private policy: PasswordPolicy
  private generatePasswordRules: GeneratePasswordRules

  constructor({ store, language }: { store: Store<unknown>; language: Language }) {
    this.capability = get(store, 'getters.capabilities.password_policy', {})
    this.language = language
    this.buildGeneratePasswordRules()
    this.buildPolicy()
  }

  private useDefaultRules(): boolean {
    return (
      Object.keys(this.capability).length === 0 ||
      (Object.keys(this.capability).length === 1 &&
        Object.keys(this.capability)[0] === 'max_characters')
    )
  }

  private buildGeneratePasswordRules(): void {
    this.generatePasswordRules = {
      length: Math.max(this.capability.min_characters || 0, 12),
      minLowercaseCharacters: Math.max(this.capability.min_lowercase_characters || 0, 2),
      minUppercaseCharacters: Math.max(this.capability.min_uppercase_characters || 0, 2),
      minSpecialCharacters: Math.max(this.capability.min_special_characters || 0, 2),
      minDigits: Math.max(this.capability.min_digits || 0, 2)
    }
    console.log(this.generatePasswordRules)
  }

  private buildPolicy(): void {
    const ruleset = {
      atLeastCharacters: new AtLeastCharactersRule({ ...this.language }),
      mustNotBeEmpty: new MustNotBeEmptyRule({ ...this.language }),
      atLeastUppercaseCharacters: new AtLeastUppercaseCharactersRule({ ...this.language }),
      atLeastLowercaseCharacters: new AtLeastLowercaseCharactersRule({ ...this.language }),
      atLeastDigits: new AtLeastDigitsRule({ ...this.language }),
      mustContain: new MustContainRule({ ...this.language }),
      atMostCharacters: new AtMostCharactersRule({ ...this.language })
    }
    const rules = {} as any

    if (this.useDefaultRules()) {
      rules.mustNotBeEmpty = {}
    }

    if (this.capability.min_characters) {
      rules.atLeastCharacters = { minLength: this.capability.min_characters }
    }

    if (this.capability.min_uppercase_characters) {
      rules.atLeastUppercaseCharacters = {
        minLength: this.capability.min_uppercase_characters
      }
    }

    if (this.capability.min_lowercase_characters) {
      rules.atLeastLowercaseCharacters = {
        minLength: this.capability.min_lowercase_characters
      }
    }

    if (this.capability.min_digits) {
      rules.atLeastDigits = { minLength: this.capability.min_digits }
    }

    if (this.capability.min_special_characters) {
      rules.mustContain = {
        minLength: this.capability.min_special_characters,
        characters: ' "!#\\$%&\'()*+,-./:;<=>?@[\\]^_`{|}~"'
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

  public generatePassword(): string {
    console.log(this.generatePasswordRules)
    return GeneratePassword({
      symbols: true,
      length: this.generatePasswordRules.length,
      minLengthLowercase: this.generatePasswordRules.minLowercaseCharacters,
      minLengthUppercase: this.generatePasswordRules.minUppercaseCharacters,
      minLengthNumbers: this.generatePasswordRules.minDigits,
      minLengthSymbols: this.generatePasswordRules.minSpecialCharacters
    })
  }
}
