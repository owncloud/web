import { MaybeRef } from 'web-pkg/src/utils'
import { ref } from '@vue/composition-api'

export interface SortableItem {
  type: string
}

export interface SortOptions<T> {
  items: MaybeRef<Array<T>>
}

export interface Resource {
  name: string
  type: string
}

export function useSort<T extends SortableItem>(options: SortOptions<T>): void {
  console.log(options)
}

const items: Resource[] = [{ name: 'foo', type: '' }]

const input = {
  items: ref(items)
}

useSort<Resource>(input)
