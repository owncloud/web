import { useCapabilityPasswordPolicy } from 'web-pkg'
import { PasswordPolicy } from 'password-sheriff'
import { isObject, isNaN, isNumber } from 'lodash-es'
import { unref } from 'vue'
import { useGettext } from 'vue3-gettext'

export class MustNotBeEmptyRule {
  protected $gettext

  constructor({ $gettext }: any) {
    this.$gettext = $gettext
  }
  explain(options, verified) {
    return {
      code: 'mustNotBeEmpty',
      message: this.$gettext('Must not be empty'),
      format: [],
      ...(verified & { verified })
    }
  }

  assert(options, password) {
    return password.length > 0
  }
  validate() {
    return true
  }
  missing(options, password) {
    return this.explain(options, this.assert(options, password))
  }
}

export class AtMostBaseRule {
  protected $ngettext
  protected override explain(options, password)
  protected override assert(options, password)
  constructor({ $ngettext }) {
    this.$ngettext = $ngettext
  }
  validate(options) {
    if (!isObject(options)) {
      throw new Error('options should be an object')
    }

    if (!isNumber(options.maxLength) || isNaN(options.maxLength)) {
      throw new Error('maxLength should be a non-zero number')
    }

    return true
  }
  missing(options, password) {
    return this.explain(options, this.assert(options, password))
  }
}

export class AtMostCharactersRule extends AtMostBaseRule {
  constructor(args) {
    super(args)
  }

  explain(options, verified) {
    return {
      code: 'atMostCharacters',
      message: this.$ngettext(
        'At most %{param} character long',
        'At most %{param} characters long',
        options.maxLength
      ),
      format: [options.maxLength],
      ...(verified & { verified })
    }
  }

  assert(options, password) {
    return password.length <= options.maxLength
  }
}

export class AtLeastBaseRule {
  protected $ngettext
  protected override explain(options, password)
  protected override assert(options, password)
  constructor({ $ngettext }) {
    this.$ngettext = $ngettext
  }
  validate(options) {
    if (!isObject(options)) {
      throw new Error('options should be an object')
    }

    if (!isNumber(options.minLength) || isNaN(options.minLength)) {
      throw new Error('minLength should be a non-zero number')
    }

    return true
  }
  missing(options, password) {
    return this.explain(options, this.assert(options, password))
  }
}

export class AtLeastCharactersRule extends AtLeastBaseRule {
  constructor(args) {
    super(args)
  }

  explain(options, verified) {
    return {
      code: 'atLeastCharacters',
      message: this.$ngettext(
        'At least %{param} character long',
        'At least %{param} characters long',
        options.minLength
      ),
      format: [options.minLength],
      ...(verified & { verified })
    }
  }

  assert(options, password) {
    return password.length >= options.minLength
  }
}

export class AtLeastUppercaseCharactersRule extends AtLeastBaseRule {
  constructor(args) {
    super(args)
  }

  explain(options, verified) {
    return {
      code: 'atLeastUppercaseCharacters',
      message: this.$ngettext(
        'At least %{param} uppercase character',
        'At least %{param} uppercase characters',
        options.minLength
      ),
      format: [options.minLength],
      ...(verified & { verified })
    }
  }

  assert(options, password) {
    const uppercaseCount = (password || '').match(/[A-Z\xC0-\xD6\xD8-\xDE]/g)?.length
    return uppercaseCount >= options.minLength
  }
}

export class AtLeastLowercaseCharactersRule extends AtLeastBaseRule {
  constructor(args) {
    super(args)
  }

  explain(options, verified) {
    return {
      code: 'atLeastLowercaseCharacters',
      message: this.$ngettext(
        'At least %{param} lowercase character',
        'At least %{param} lowercase characters',
        options.minLength
      ),
      format: [options.minLength],
      ...(verified & { verified })
    }
  }

  assert(options, password) {
    const lowercaseCount = (password || '').match(/[a-z\xDF-\xF6\xF8-\xFF]/g)?.length
    return lowercaseCount >= options.minLength
  }
}

export class AtLeastDigitsRule extends AtLeastBaseRule {
  constructor(args) {
    super(args)
  }

  explain(options, verified) {
    return {
      code: 'atLeastDigits',
      message: this.$ngettext(
        'At least %{param} number',
        'At least %{param} numbers',
        options.minLength
      ),
      format: [options.minLength],
      ...(verified & { verified })
    }
  }

  assert(options, password) {
    const digitCount = (password || '').match(/\d/g)?.length
    return digitCount >= options.minLength
  }
}
export function usePasswordPolicyService(
  { useDefaultRules = true } = { useDefaultRules: Boolean }
): Array<any> {
  const passwordPolicyCapability = unref(useCapabilityPasswordPolicy())
  const passwordPolicyRules = []

  if (useDefaultRules && !passwordPolicyCapability.min_characters) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        { mustNotBeEmpty: {} },
        { mustNotBeEmpty: new MustNotBeEmptyRule({ ...useGettext() }) }
      )
    )
  }

  if (passwordPolicyCapability.min_characters) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        { atLeastCharacters: { minLength: passwordPolicyCapability.min_characters } },
        { atLeastCharacters: new AtLeastCharactersRule({ ...useGettext() }) }
      )
    )
  }

  if (passwordPolicyCapability.min_upper_case_characters) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        {
          atLeastUppercaseCharacters: {
            minLength: passwordPolicyCapability.min_upper_case_characters
          }
        },
        { atLeastUppercaseCharacters: new AtLeastUppercaseCharactersRule({ ...useGettext() }) }
      )
    )
  }

  if (passwordPolicyCapability.min_lower_case_characters) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        {
          atLeastLowercaseCharacters: {
            minLength: passwordPolicyCapability.min_lower_case_characters
          }
        },
        { atLeastLowercaseCharacters: new AtLeastLowercaseCharactersRule({ ...useGettext() }) }
      )
    )
  }

  if (passwordPolicyCapability.min_digits) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        { atLeastDigits: { minLength: passwordPolicyCapability.min_digits } },
        { atLeastDigits: new AtLeastDigitsRule({ ...useGettext() }) }
      )
    )
  }

  if (useDefaultRules) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        { atMostCharacters: { maxLength: 72 } },
        { atMostCharacters: new AtMostCharactersRule({ ...useGettext() }) }
      )
    )
  }

  return passwordPolicyRules
}
