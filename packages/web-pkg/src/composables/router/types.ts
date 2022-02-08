type Dictionary<T> = { [key: string]: T }

export type QueryValue = string | (string | null)[]
export type LocationQuery = Dictionary<QueryValue>

export type ParamValue = string
export type LocationParams = Dictionary<ParamValue>
