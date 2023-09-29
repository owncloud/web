import { mock } from 'jest-mock-extended'
import { ref } from 'vue'
import { Resource } from '@ownclouders/web-client/src'
import { FileResource } from '@ownclouders/web-client/src/helpers'
import { GetFileContentsResponse } from '@ownclouders/web-client/src/webdav/getFileContents'
import { FileContext, useAppDefaults, AppConfigObject } from '@ownclouders/web-pkg'

export const useAppDefaultsMock = (
  options: Partial<ReturnType<typeof useAppDefaults>> = {}
): ReturnType<typeof useAppDefaults> => {
  return {
    isPublicLinkContext: ref(false),
    currentFileContext: ref(mock<FileContext>()),
    applicationConfig: ref(mock<AppConfigObject>()),
    closeApp: jest.fn(),
    replaceInvalidFileRoute: jest.fn(),
    getUrlForResource: jest.fn(),
    revokeUrl: jest.fn(),
    getFileInfo: jest.fn().mockImplementation(() => mock<Resource>()),
    getFileContents: jest
      .fn()
      .mockImplementation(() => mock<GetFileContentsResponse>({ body: '' })),
    putFileContents: jest.fn().mockImplementation(() => mock<FileResource>()),
    isFolderLoading: ref(false),
    activeFiles: ref([]),
    loadFolderForFileContext: jest.fn(),
    makeRequest: jest.fn().mockResolvedValue({ status: 200 }),
    closed: ref(false),
    ...options
  }
}
