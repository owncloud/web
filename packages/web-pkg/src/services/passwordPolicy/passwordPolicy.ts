import { Language } from 'vue3-gettext'
import {
  AtLeastCharactersRule,
  AtLeastDigitsRule,
  AtLeastLowercaseCharactersRule,
  AtLeastUppercaseCharactersRule,
  MustContainRule,
  MustNotBeEmptyRule
} from './rules'
import { PasswordPolicyCapability } from '@ownclouders/web-client/ocs'
import { GeneratePassword } from 'js-generate-password'
import { CapabilityStore } from '../../composables'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PasswordPolicy } from 'password-sheriff'

interface GeneratePasswordRules {
  length: number
  minLowercaseCharacters: number
  minUppercaseCharacters: number
  minSpecialCharacters: number
  minDigits: number
}

export class PasswordPolicyService {
  private readonly language: Language
  private capability: PasswordPolicyCapability
  private policy: PasswordPolicy
  private generatePasswordRules: GeneratePasswordRules

  constructor({ language }: { language: Language }) {
    this.language = language
  }

  public initialize(capabilityStore: CapabilityStore) {
    this.capability = capabilityStore.passwordPolicy
    this.buildGeneratePasswordRules()
    this.buildPolicy()
  }

  private useDefaultRules(): boolean {
    return (
      !this.capability.min_characters &&
      !this.capability.min_lowercase_characters &&
      !this.capability.min_uppercase_characters &&
      !this.capability.min_digits &&
      !this.capability.min_special_characters
    )
  }

  private buildGeneratePasswordRules(): void {
    const DEFAULT_LENGTH = 12
    const DEFAULT_MIN_LOWERCASE_CHARACTERS = 2
    const DEFAULT_MIN_UPPERCASE_CHARACTERS = 2
    const DEFAULT_MIN_SPECIAL_CHARACTERS = 2
    const DEFAULT_MIN_DIGITS = 2

    this.generatePasswordRules = {
      length: Math.max(
        this.capability.min_characters || 0,
        (this.capability.min_lowercase_characters || 0) +
          (this.capability.min_uppercase_characters || 0) +
          (this.capability.min_digits || 0) +
          (this.capability.min_special_characters || 0),
        DEFAULT_LENGTH
      ),
      minLowercaseCharacters: Math.max(
        this.capability.min_lowercase_characters || 0,
        DEFAULT_MIN_LOWERCASE_CHARACTERS
      ),
      minUppercaseCharacters: Math.max(
        this.capability.min_uppercase_characters || 0,
        DEFAULT_MIN_UPPERCASE_CHARACTERS
      ),
      minSpecialCharacters: Math.max(
        this.capability.min_special_characters || 0,
        DEFAULT_MIN_SPECIAL_CHARACTERS
      ),
      minDigits: Math.max(this.capability.min_digits || 0, DEFAULT_MIN_DIGITS)
    }
  }

  private buildPolicy(): void {
    const ruleset = {
      atLeastCharacters: new AtLeastCharactersRule({ ...this.language }),
      mustNotBeEmpty: new MustNotBeEmptyRule({ ...this.language }),
      atLeastUppercaseCharacters: new AtLeastUppercaseCharactersRule({ ...this.language }),
      atLeastLowercaseCharacters: new AtLeastLowercaseCharactersRule({ ...this.language }),
      atLeastDigits: new AtLeastDigitsRule({ ...this.language }),
      mustContain: new MustContainRule({ ...this.language })
    }
    const rules = {} as Record<string, unknown>

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

    this.policy = new PasswordPolicy(rules, ruleset)
  }

  public getPolicy(): PasswordPolicy {
    return this.policy
  }

  public generatePassword(): string {
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
