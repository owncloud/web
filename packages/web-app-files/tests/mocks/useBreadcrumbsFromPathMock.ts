import { useBreadcrumbsFromPath } from '@ownclouders/web-pkg'

export const useBreadcrumbsFromPathMock = (
  options: Partial<ReturnType<typeof useBreadcrumbsFromPath>> = {}
): ReturnType<typeof useBreadcrumbsFromPath> => {
  return {
    breadcrumbsFromPath: jest.fn(() => []),
    concatBreadcrumbs: jest.fn((...args) => args),
    ...options
  }
}
