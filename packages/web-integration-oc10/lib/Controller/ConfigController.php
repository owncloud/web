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

use OC\AppFramework\Http;
use OCP\App\IAppManager;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\ILogger;
use OCP\IRequest;

/**
 * Class ConfigController
 *
 * @package OCA\Web\Controller
 */
class ConfigController extends Controller {

    /**
     * @var ILogger
     */
    private $logger;

    /**
     * @var IAppManager
     */
    private $appManager;

    /**
     * ConfigController constructor.
     *
     * @param string $appName
     * @param IRequest $request
     * @param ILogger $logger
     * @param IAppManager $appManager
     */
    public function __construct(string $appName, IRequest $request, ILogger $logger, IAppManager $appManager) {
        parent::__construct($appName, $request);
        $this->logger = $logger;
        $this->appManager = $appManager;
    }

    /**
     * Loads the config json file for ownCloud Web
     *
	 * @PublicPage
	 * @NoCSRFRequired
     *
     * @return JSONResponse
     */
    public function getConfig(): JSONResponse {
        try {
            $configFile = \OC::$SERVERROOT . '/config/config.json';
            $configContent = \file_get_contents($configFile);
            $configAssoc = \json_decode($configContent, true);
            $extendedConfig = $this->addOC10AppsToConfig($configAssoc);
            $response = new JSONResponse($extendedConfig);
			$response->addHeader('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate');
			$response->addHeader('Pragma', 'no-cache');
			$response->addHeader('Expires', 'Wed, 11 Jan 1984 05:00:00 GMT');
			$response->addHeader('X-Frame-Options', 'DENY');
			return $response;
        } catch(\Exception $e) {
            $this->logger->logException($e, ['app' => 'web']);
            return new JSONResponse(["message" => $e->getMessage()], Http::STATUS_NOT_FOUND);
        }
    }

    /**
     * Add enabled OC10 apps to the loaded config. This ensures that they are
     * listed in the app switcher menu.
     *
     * @param array $config
     * @return array
     */
    private function addOC10AppsToConfig(array $config): array {
        $apps = $config['applications'] ?? [];

        $oc10NavigationEntries = \OC::$server->getNavigationManager()->getAll();
        $serverUrl = $this->request->getServerProtocol() . '://' . $this->request->getServerHost();

        $ignoredApps = ['files', 'web'];
        $supportedLanguages = ['en', 'fr', 'de', 'es', 'it', 'cs', 'gl'];

        foreach ($oc10NavigationEntries as $navigationEntry) {
            if (\in_array($navigationEntry['id'], $ignoredApps)) {
                continue;
            }

            $appInfo = $this->appManager->getAppInfo($navigationEntry['id']);

            $titles = [];
            foreach ($supportedLanguages as $lang) {
                $l10n = \OC::$server->getL10N($appInfo['id'], $lang);
                $titles[$lang] = $l10n->t($navigationEntry['name']);
            }

            $apps[] = [
                'title' => $titles,
                'url' => $serverUrl . $navigationEntry['href'],
                'icon' => 'swap-box',
            ];
        }

        $config['applications'] = $apps;
        return $config;
    }
}
