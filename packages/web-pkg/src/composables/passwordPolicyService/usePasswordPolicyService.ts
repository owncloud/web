import { useCapabilityPasswordPolicy } from 'web-pkg'
import { PasswordPolicy } from 'password-sheriff'
import { isObject, isNaN, isNumber } from 'lodash-es'
import { unref } from 'vue'
import { useGettext } from 'vue3-gettext'

class AtLeastBaseRule {
  protected $ngettext
  protected override explain(options, password)
  protected override assert(options, password)
  constructor($ngettext) {
    this.$ngettext = $ngettext
  }
  validate(options) {
    if (!isObject(options)) {
      throw new Error('options should be an object')
    }

    if (!isNumber(options.minLength) || isNaN(options.minLength)) {
      throw new Error('atLeastDigits expects minLength to be a non-zero number')
    }

    return true
  }
  missing(options, password) {
    return this.explain(options, this.assert(options, password))
  }
}

class AtLeastCharactersRule extends AtLeastBaseRule {
  constructor($gettext) {
    super($gettext)
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

class AtLeastDigitsRule extends AtLeastBaseRule {
  constructor($ngettext) {
    super($ngettext)
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
export function usePasswordPolicyService(): [] {
  const { $ngettext } = useGettext()
  const passwordPolicyCapability = unref(useCapabilityPasswordPolicy())
  const passwordPolicyRules = []

  if (passwordPolicyCapability.min_characters) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        { atLeastCharacters: { minLength: passwordPolicyCapability.min_characters } },
        { atLeastCharacters: new AtLeastCharactersRule($ngettext) }
      )
    )
  }

  if (passwordPolicyCapability.min_digits) {
    passwordPolicyRules.push(
      new PasswordPolicy(
        { atLeastDigits: { minLength: passwordPolicyCapability.min_digits } },
        { atLeastDigits: new AtLeastDigitsRule($ngettext) }
      )
    )
  }

  return passwordPolicyRules
}
