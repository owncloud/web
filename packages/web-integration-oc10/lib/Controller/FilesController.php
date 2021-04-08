<?php
/**
 * @author Benedikt Kulmann <bkulmann@owncloud.com>
 *
 * @copyright Copyright (c) 2020, ownCloud GmbH
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

namespace OCA\Web\Controller;

use GuzzleHttp\Mimetypes;
use OC\AppFramework\Http;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\DataDisplayResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Response;
use OCP\ILogger;
use OCP\IRequest;

/**
 * Class FilesController
 *
 * @package OCA\Web\Controller
 */
class FilesController extends Controller {

	/**
	 * @var ILogger
	 */
	private $logger;

	/**
	 * FilesController constructor.
	 *
	 * @param string $appName
	 * @param IRequest $request
	 * @param ILogger $logger
	 */
	public function __construct(string $appName, IRequest $request, ILogger $logger) {
		parent::__construct($appName, $request);
		$this->logger = $logger;
	}

	/**
	 * Tries to load a file by the given $path.
	 *
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param $path string
	 * @return DataResponse
	 */
	public function getFile(string $path): Response {
		// don't allow directory traversal to parents
		if (\strpos($path, "..") !== false) {
			return new DataResponse(['error' => 'resource not found'], Http::STATUS_NOT_FOUND);
		}

		// check if path permitted
		$permittedPaths = ["css", "img", "js", "themes", "index.html", "manifest.json", "oidc-callback.html", "oidc-silent-redirect.html"];
		$found = false;
		foreach ($permittedPaths as $p) {
			if (\strpos($path, $p) === 0) {
				$found = true;
				break;
			}
		}
		if (!$found) {
			return new DataResponse(['error' => 'resource not found'], Http::STATUS_NOT_FOUND);
		}

		// check if path resolves to an actual file
		if (\is_dir($path)) {
			return new DataResponse(['error' => 'resource not found'], Http::STATUS_NOT_FOUND);
		}
		$basePath = \dirname(__DIR__,2);
		$absolutePath = \realpath( $basePath . '/' . $path);
		if ($absolutePath === false) {
			return new DataResponse(['error' => 'resource not found'], Http::STATUS_NOT_FOUND);
		}
		if (\strpos($absolutePath, $basePath) !== 0) {
			return new DataResponse(['error' => 'resource not found'], Http::STATUS_NOT_FOUND);
		}

		$response = new DataDisplayResponse(\file_get_contents($absolutePath), Http::STATUS_OK, [
			'Content-Type' => $this->getMimeType($absolutePath),
			'Content-Length' => \filesize($absolutePath),
			'Cache-Control' => 'max-age=0, no-cache, no-store, must-revalidate',
			'Pragma' => 'no-cache',
			'Expires' => 'Wed, 11 Jan 1984 05:00:00 GMT',
			'X-Frame-Options' => 'DENY'
		]);
		if (\strpos($path, "index.html") === 0 || \strpos($path, "oidc-callback.html") === 0 || \strpos($path, "oidc-silent-redirect.html") === 0) {
			$csp = new ContentSecurityPolicy();
			$csp->allowInlineScript(true);
			$response->setContentSecurityPolicy($csp);
		}

		return $response;
	}

	private function getMimeType(string $filename): string {
		$mimeTypes = Mimetypes::getInstance();
		return $mimeTypes->fromFilename($filename);
	}
}
