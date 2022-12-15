import { mockDeep } from 'jest-mock-extended'
import { ref } from 'vue'
import { Resource } from 'web-client/src'
import { FileResource } from 'web-client/src/helpers'
import { GetFileContentsResponse } from 'web-client/src/webdav/getFileContents'
import { AppConfigObject, FileContext, useAppDefaults } from 'web-pkg/src'

export const useAppDefaultsMock = (
  options: Partial<ReturnType<typeof useAppDefaults>> = {}
): ReturnType<typeof useAppDefaults> => {
  return {
    isPublicLinkContext: ref(false),
    currentFileContext: ref(mockDeep<FileContext>()),
    applicationConfig: ref(mockDeep<AppConfigObject>()),
    closeApp: jest.fn(),
    replaceInvalidFileRoute: jest.fn(),
    getUrlForResource: jest.fn(),
    revokeUrl: jest.fn(),
    getFileInfo: jest.fn().mockImplementation(() => mockDeep<Resource>()),
    getFileContents: jest
      .fn()
      .mockImplementation(() => mockDeep<GetFileContentsResponse>({ body: '' })),
    putFileContents: jest.fn().mockImplementation(() => mockDeep<FileResource>()),
    isFolderLoading: ref(false),
    activeFiles: ref([]),
    loadFolderForFileContext: jest.fn(),
    makeRequest: jest.fn().mockResolvedValue({ status: 200 }),
    ...options
  }
}
