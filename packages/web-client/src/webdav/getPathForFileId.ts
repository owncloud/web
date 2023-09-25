import { WebDavOptions } from './types'

export const GetPathForFileIdFactory = ({ sdk }: WebDavOptions) => {
  return {
    getPathForFileId(id: string): Promise<string> {
      return sdk.files.getPathForFileId(id)
    }
  }
}
