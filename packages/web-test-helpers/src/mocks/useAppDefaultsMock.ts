import { mock } from 'jest-mock-extended'
import { ref } from 'vue'
import { Resource } from 'web-client/src'
import { FileResource } from 'web-client/src/helpers'
import { GetFileContentsResponse } from 'web-client/src/webdav/getFileContents'
import { AppConfigObject } from '@ownclouders/web-pkg'
import { FileContext, useAppDefaults } from '@ownclouders/web-pkg'

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
