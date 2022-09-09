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
use OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IUserSession;

/**
 * Class SettingsController
 *
 * @package OCA\Web\Controller
 */
class SettingsController extends Controller {

	/**
	 * @var IConfig
	 */
	private $config;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * @param string $appName
	 * @param IRequest $request an instance of the request
	 * @param IUserSession $userSession
	 * @param IConfig $config
	 */
	public function __construct(
		$appName,
		IRequest $request,
		IUserSession $userSession,
		IConfig $config
	) {
		parent::__construct($appName, $request);
		$this->config = $config;
		$this->userSession = $userSession;
	}

	/**
	 * Set the web default config.
	 *
	 * @NoAdminRequired
	 *
	 * @return JSONResponse
	 */
	public function setWebDefaultConfig() {
		$value = \filter_var($this->request->getParam('isDefault'), FILTER_VALIDATE_BOOLEAN);
		$user = $this->userSession->getUser();
		$configToSet = $value === true ? 'web' : 'files';
		$this->config->setUserValue($user->getUID(), 'core', 'defaultapp', $configToSet);

		return new JSONResponse([]);
	}
}
