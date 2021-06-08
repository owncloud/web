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

use OCA\Web\Application;

$app = new Application();
$app->registerRoutes(
    $this,
    [
        'routes' => [
            ['name' => 'Index#index', 'url' => '/', 'verb' => 'GET'],
            ['name' => 'Config#getConfig', 'url' => '/config.json', 'verb' => 'GET'],
            [
            	'name' => 'Files#getFile',
				'url' => '/{path}',
				'verb' => 'GET',
				'requirements' => ['path' => '.+'],
				'defaults' => ['path' => 'index.html']
			]
        ]
    ]
);
