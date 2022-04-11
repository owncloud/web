import XHRUpload from '@uppy/xhr-upload'
import Uppy from '@uppy/core'
import StatusBar from '@uppy/status-bar'

// @TODO Initialize uppy globally with capabilities and configuration
export class UppyService {
  public getUppyInstance({
    uploadPath,
    configuration,
    capabilities,
    headers,
    $gettext,
    customTus // @FIXME Remove here, import the plugin instead... is not working for some reason
  }): Uppy {
    const uppy = new Uppy({
      debug: true,
      autoProceed: true
    })

    const tusSupport = UppyService.tusSupport(capabilities)

    // TODO: What about flaky capability loading and its implications?
    if (tusSupport) {
      const chunkSize =
        tusSupport && configuration.uploadChunkSize !== Infinity
          ? Math.max(capabilities.files.tus_support.max_chunk_size, configuration.uploadChunkSize)
          : configuration.uploadChunkSize

      uppy.use(customTus, {
        endpoint: uploadPath,
        headers,
        chunkSize: chunkSize,
        removeFingerprintOnSuccess: true,
        overridePatchMethod: !!capabilities.files.tus_support.http_method_override,
        retryDelays: [0, 3000, 5000, 10000, 20000]
      })
    } else {
      uppy.use(XHRUpload, {
        endpoint: uploadPath,
        method: 'put',
        headers,
        getResponseData() {
          return {}
        }
      })
    }

    uppy.use(StatusBar, {
      id: 'StatusBar',
      target: '.upload-info-status-bar',
      hideAfterFinish: true,
      showProgressDetails: true,
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideCancelButton: false,
      doneButtonHandler: null,
      locale: {
        strings: {
          uploading: $gettext('Uploading'),
          complete: $gettext('Complete'),
          uploadFailed: $gettext('Upload failed'),
          paused: $gettext('Paused'),
          retry: $gettext('Retry'),
          cancel: $gettext('Cancel'),
          pause: $gettext('Pause'),
          resume: $gettext('Resume'),
          done: $gettext('Done'),
          filesUploadedOfTotal: {
            0: $gettext('%{complete} of %{smart_count} file uploaded'),
            1: $gettext('%{complete} of %{smart_count} files uploaded')
          },
          dataUploadedOfTotal: $gettext('%{complete} of %{total}'),
          xTimeLeft: $gettext('%{time} left'),
          uploadXFiles: {
            0: $gettext('Upload %{smart_count} file'),
            1: $gettext('Upload %{smart_count} files')
          },
          uploadXNewFiles: {
            0: $gettext('Upload +%{smart_count} file'),
            1: $gettext('Upload +%{smart_count} files')
          },
          upload: $gettext('Upload'),
          retryUpload: $gettext('Retry upload'),
          xMoreFilesAdded: {
            0: $gettext('%{smart_count} more file added'),
            1: $gettext('%{smart_count} more files added')
          },
          showErrorDetails: $gettext('Show error details')
        }
      }
    })

    return uppy
  }

  private static tusSupport(capabilities) {
    return capabilities.files?.tus_support?.max_chunk_size > 0
  }
}

export const uppyService = new UppyService()
