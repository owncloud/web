import { useAbility as _useAbility } from '@casl/vue'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'

export const useAbility = () => _useAbility<Ability>()
