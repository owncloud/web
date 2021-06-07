<?php
/**
 * @author Jannik Stehle <jstehle@owncloud.com>
 * @author Jan Ackermann <jackermann@owncloud.com>
 *
 * @copyright Copyright (c) 2021, ownCloud GmbH
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

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IRequest;

/**
 * Class IndexController
 *
 * @package OCA\Web\Controller
 */
class IndexController extends Controller {

    /**
     * @var IConfig
     */
    private $config;
    /**
     * @var IL10N
     */
    private $l10n;

    /**
     * IndexController constructor.
     *
     * @param string $appName
     * @param IRequest $request
     * @param IConfig $config
     * @param IL10N $l10n
     */
    public function __construct(string $appName, IRequest $request, IConfig $config, IL10N $l10n) {
        parent::__construct($appName, $request);
        $this->config = $config;
        $this->l10n = $l10n;
    }

    /**
     * Loads the WebUI index page according to the web.baseUrl config.
     * Then appends "/index.html" to the URL as this is needed to load the page properly.
     *
     * @PublicPage
     * @NoCSRFRequired
     *
     * @return RedirectResponse | TemplateResponse
     */
    public function index(): Response {
        $webBaseUrl = $this->config->getSystemValue('web.baseUrl', null);
        if (!$webBaseUrl) {
            // Check the old phoenix.baseUrl system key to provide compatibility across
            // the name change from phoenix to web.
            $webBaseUrl = \OC::$server->getConfig()->getSystemValue('phoenix.baseUrl', null);
        }

        if ($webBaseUrl) {
            $webBaseUrl = \rtrim($webBaseUrl, '/') . '/index.html';
            return new RedirectResponse($webBaseUrl);
        }

        return new TemplateResponse(
            'core', 'error',
            [
                "errors" => [["error" => $this->l10n->t('Unable to reach the WebURL. Please contact your administrator.')]]
            ], 'guest'
        );
    }
}
