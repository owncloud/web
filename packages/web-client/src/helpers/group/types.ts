import { Item } from '../item'
import { Group as ApiGroup } from '../../generated/api'

export interface Group extends Item, ApiGroup {}
