import { useAbility as _useAbility } from '@casl/vue'
import { Ability } from 'web-client/src/helpers/resource/types'

export const useAbility = () => _useAbility<Ability>()
