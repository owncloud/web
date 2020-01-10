config = {
	'app': 'phoenix',
	'rocketchat': {
		'channel': 'builds',
		'from_secret': 'private_rocketchat'
	},

	'branches': [
		'master',
		'release*',
		'develop*'
	],

	'yarnlint': True,

	'acceptance': {
		'webUI': {
			'suites': {
				'webUIFavorites': 'Favorites',
				'webUIFiles': 'Files',
				'webUILogin': 'Login',
				'webUINotifications': 'Notifications',
				'webUIPrivateLinks': 'PrivateLinks',
				'webUIRenameFiles': 'RenameFiles',
				'webUIRenameFolders': 'RenameFolders',
				'webUIRestrictSharing': 'RestrictSharing',
				'webUISharingAutocompletion': 'SharingAutocompletion',
				'webUISharingInternalGroups': 'SharingInternalGroups',
				'webUISharingInternalUsers': 'SharingInternalUsers',
				'webUISharingPermissionsUsers': 'SharingPermissionsUsers',
				'webUISharingFilePermissionsGroups': 'SharingFilePermissionsGroups',
				'webUISharingFolderPermissionsGroups': 'SharingFolderPermissionsGroups',
				'webUIResharing': 'Resharing',
				'webUISharingPublic': 'SharingPublic',
				'webUITrashbin': 'Trashbin',
				'webUIUpload': 'Upload',
				'webUISharingAcceptShares': 'SharingAcceptShares',
				'webUISharingPermissionMultipleUsers': 'SharingPermissionMultipleUsers',
				'webUISharingNotifications': 'SharingNotifications',
				'webUIAccount': 'Account'
			},
		},
		'webUIFederation': {
			'suites': {
				'webUISharingExternal': 'SharingExternal',
			},
			'extraEnvironment': {
				'REMOTE_BACKEND_HOST': 'http://federated'
			},
			'federatedServerNeeded': True,
			'federatedServerVersion': 'daily-master-qa'
		},
		'webUI-XGA': {
			'suites': {
				'all': 'XGAPortrait',
			},
			'extraEnvironment': {
				'SCREEN_RESOLUTION': '768x1024'
			},
			'filterTags': '@smokeTest and not @skipOnXGAPortraitResolution and not @skip'
		},
		'webUI-iPhone': {
			'suites': {
				'all': 'iPhone',
			},
			'extraEnvironment': {
				'SCREEN_RESOLUTION': '375x812'
			},
			'filterTags': '@smokeTest and not @skipOnIphoneResolution and not @skip'
		},
	},

	'build': True
}

def main(ctx):
	before = beforePipelines(ctx)

	stages = stagePipelines(ctx)
	if (stages == False):
		print('Errors detected. Review messages above.')
		return []

	dependsOn(before, stages)

	after = afterPipelines()
	dependsOn(stages, after)

	return before + stages + after

def beforePipelines(ctx):
	return yarnlint() + changelog(ctx)

def stagePipelines(ctx):
	acceptancePipelines = acceptance()
	buildPipelines = build(ctx)
	if (acceptancePipelines == False) or (buildPipelines == False):
		return False

	return acceptancePipelines + buildPipelines

def afterPipelines():
	return [
		notify()
	]

def yarnlint():
	pipelines = []

	if 'yarnlint' not in config:
		return pipelines

	if type(config['yarnlint']) == "bool":
		if not config['yarnlint']:
			return pipelines

	result = {
		'kind': 'pipeline',
		'type': 'docker',
		'name': 'lint-test',
		'workspace' : {
			'base': '/var/www/owncloud',
			'path': config['app']
		},
		'steps':
			installNPM() +
			lintTest(),
		'depends_on': [],
		'trigger': {
			'ref': [
				'refs/tags/**',
				'refs/pull/**',
				'refs/pull-requests/**',
				'refs/merge-requests/**',
			]
		}
	}

	for branch in config['branches']:
		result['trigger']['ref'].append('refs/heads/%s' % branch)

	pipelines.append(result)

	return pipelines

def build(ctx):
	pipelines = []

	if 'build' not in config:
		return pipelines

	if type(config['build']) == "bool":
		if not config['build']:
			return pipelines

	result = {
		'kind': 'pipeline',
		'type': 'docker',
		'name': 'publish-npm-and-demo-system',
		'workspace' : {
			'base': '/var/www/owncloud',
			'path': config['app']
		},
		'steps':
			installNPM() +
			buildRelease(ctx) +
			deployStaging() +
			buildDockerImage(),
		'depends_on': [],
		'trigger': {
			'ref': [
				'refs/merge-requests/**',
				'refs/heads/master',
	            'refs/tags/**',
			]
		}
	}

	pipelines.append(result)

	return pipelines

def changelog(ctx):
    pipelines = []

    result = {
        'kind': 'pipeline',
        'type': 'docker',
        'name': 'changelog',
        'clone': {
            'disable': True,
        },
        'steps':
            [
				{
					'name': 'clone',
					'image': 'plugins/git-action:1',
					'pull': 'always',
					'settings': {
						'actions': [
							'clone',
						],
						'remote': 'https://github.com/%s' % (ctx.repo.slug),
						'branch': ctx.build.source if ctx.build.event == 'pull_request' else 'master',
						'path': '/drone/src',
						'netrc_machine': 'github.com',
						'netrc_username': {
							'from_secret': 'github_username',
						},
						'netrc_password': {
							'from_secret': 'github_token',
						},
					},
				},
                {
                    'name': 'generate',
                    'image': 'toolhippie/calens:latest',
                    'pull': 'always',
                    'commands': [
                        'calens >| CHANGELOG.md',
                    ],
                },
                {
                    'name': 'diff',
                    'image': 'owncloud/alpine:latest',
                    'pull': 'always',
                    'commands': [
                        'git diff',
                    ],
                },
                {
                    'name': 'output',
                    'image': 'toolhippie/calens:latest',
                    'pull': 'always',
                    'commands': [
                        'cat CHANGELOG.md',
                    ],
                },
                {
                    'name': 'publish',
                    'image': 'plugins/git-action:1',
                    'pull': 'always',
                    'settings': {
                        'actions': [
                            'commit',
                            'push',
                        ],
                        'message': 'Automated changelog update [skip ci]',
                        'branch': 'master',
                        'author_email': 'devops@owncloud.com',
                        'author_name': 'ownClouders',
                        'netrc_machine': 'github.com',
                        'netrc_username': {
                            'from_secret': 'github_username',
                        },
                        'netrc_password': {
                            'from_secret': 'github_token',
                        },
                    },
                    'when': {
                        'ref': {
                            'exclude': [
                                'refs/pull/**',
								'refs/tags/**'
                            ],
                        },
                    },
                },
            ],
        'depends_on': [],
        'trigger': {
            'ref': [
                'refs/heads/master',
                'refs/pull/**',
            ],
        },
    }

    pipelines.append(result)

    return pipelines

def acceptance():
	pipelines = []

	if 'acceptance' not in config:
		return pipelines

	if type(config['acceptance']) == "bool":
		if not config['acceptance']:
			return pipelines

	errorFound = False

	default = {
		'servers': ['daily-master-qa'],
		'browsers': ['chrome'],
		'databases': ['mysql:5.5'],
		'extraEnvironment': {},
		'cronOnly': False,
		'filterTags': 'not @skip',
		'logLevel': '2',
		'federatedServerNeeded': False,
		'federatedServerVersion': '',
	}

	if 'defaults' in config:
		if 'acceptance' in config['defaults']:
			for item in config['defaults']['acceptance']:
				default[item] = config['defaults']['acceptance'][item]

	for category, matrix in config['acceptance'].items():
		if type(matrix['suites']) == "list":
			suites = {}
			for suite in matrix['suites']:
				suites[suite] = suite
		else:
			suites = matrix['suites']

		for suite, alternateSuiteName in suites.items():

			params = {}
			for item in default:
				params[item] = matrix[item] if item in matrix else default[item]

			for server in params['servers']:
				for browser in params['browsers']:
					for db in params['databases']:
						federatedServerVersion = params['federatedServerVersion']
						federationDbSuffix = '-federated'

						if params['federatedServerNeeded'] and getDbName(db) not in ['mariadb', 'mysql']:
							errorFound = True

						browserString = '' if browser == '' else '-' + browser
						name = '%s%s' % (alternateSuiteName, browserString)
						maxLength = 50
						nameLength = len(name)
						if nameLength > maxLength:
							print("Error: generated stage name of length", nameLength, "is not supported. The maximum length is " + str(maxLength) + ".", name)
							errorFound = True
						result = {
							'kind': 'pipeline',
							'type': 'docker',
							'name': name,
							'workspace' : {
								'base': '/var/www/owncloud',
								'path': config['app']
							},
							'steps':
								installNPM() +
								buildPhoenix() +
								installCore(server, db) +
								cloneOauth() +
								setupServerAndApp(params['logLevel']) +
								owncloudLog() +
								fixPermissions() +
								(
									installFederatedServer(federatedServerVersion, db, federationDbSuffix) +
									setupFedServerAndApp(params['logLevel']) +
									fixPermissionsFederated() +
									owncloudLogFederated() if params['federatedServerNeeded'] else []
								) +
								copyFilesForUpload() +
								runWebuiAcceptanceTests(suite, alternateSuiteName, params['filterTags'], params['extraEnvironment'], browser),
							'services':
								phoenixService() +
								owncloudService() +
								(
									owncloudFederatedService() +
									databaseServiceForFederation(db, federationDbSuffix)
									if params['federatedServerNeeded'] else []
								) +
								browserService(alternateSuiteName, browser) +
								databaseService(db),
							'depends_on': [],
							'trigger': {
								'ref': [
									'refs/tags/**',
									'refs/pull/**',
									'refs/pull-requests/**',
									'refs/merge-requests/**',
								]
							},
							'volumes': [{
								'name': 'uploads',
								'temp': {}
							}]
						}

						for branch in config['branches']:
							result['trigger']['ref'].append('refs/heads/%s' % branch)

						if (params['cronOnly']):
							result['trigger']['event'] = ['cron']

						pipelines.append(result)

	if errorFound:
		return False

	return pipelines

def notify():
	result = {
		'kind': 'pipeline',
		'type': 'docker',
		'name': 'chat-notifications',
		'clone': {
			'disable': True
		},
		'steps': [
			{
				'name': 'notify-rocketchat',
				'image': 'plugins/slack:1',
				'pull': 'always',
				'settings': {
					'webhook': {
						'from_secret': config['rocketchat']['from_secret']
					},
					'channel': config['rocketchat']['channel']
				}
			}
		],
		'depends_on': [],
		'trigger': {
			'ref': [
				'refs/tags/**'
			],
			'status': [
				'success',
				'failure'
			]
		}
	}

	for branch in config['branches']:
		result['trigger']['ref'].append('refs/heads/%s' % branch)

	return result

def databaseServiceForFederation(db, suffix):
	dbName = getDbName(db)

	# only support mariadb, for phoenix, it's not important to support others
	if dbName not in ['mariadb', 'mysql']:
		print('Not implemented federated database for', dbName)
		return []

	return [{
		'name': dbName + suffix,
		'image': db,
		'pull': 'always',
		'environment': {
			'MYSQL_USER': getDbUsername(db),
			'MYSQL_PASSWORD': getDbPassword(db),
			'MYSQL_DATABASE': getDbDatabase(db) + suffix,
			'MYSQL_ROOT_PASSWORD': getDbRootPassword()
		}
	}]

def databaseService(db):
	dbName = getDbName(db)
	if (dbName == 'mariadb') or (dbName == 'mysql'):
		return [{
			'name': dbName,
			'image': db,
			'pull': 'always',
			'environment': {
				'MYSQL_USER': getDbUsername(db),
				'MYSQL_PASSWORD': getDbPassword(db),
				'MYSQL_DATABASE': getDbDatabase(db),
				'MYSQL_ROOT_PASSWORD': getDbRootPassword()
			}
		}]

	if dbName == 'postgres':
		return [{
			'name': dbName,
			'image': db,
			'pull': 'always',
			'environment': {
				'POSTGRES_USER': getDbUsername(db),
				'POSTGRES_PASSWORD': getDbPassword(db),
				'POSTGRES_DB': getDbDatabase(db)
			}
		}]

	if dbName == 'oracle':
		return [{
			'name': dbName,
			'image': 'deepdiver/docker-oracle-xe-11g:latest',
			'pull': 'always',
			'environment': {
				'ORACLE_USER': getDbUsername(db),
				'ORACLE_PASSWORD': getDbPassword(db),
				'ORACLE_DB': getDbDatabase(db),
				'ORACLE_DISABLE_ASYNCH_IO': 'true',
			}
		}]

	return []

def browserService(alternateSuiteName, browser):
	if browser == 'chrome':
		return [{
			'name': 'selenium',
			'image': 'selenium/standalone-chrome-debug:3.141.59-xenon',
			'pull': 'always',
			'volumes': [{
				'name': 'uploads',
				'path': '/uploads'
			}],
		}]

	if browser == 'firefox':
		return [{
			'name': 'selenium',
			'image': 'selenium/standalone-firefox-debug:3.141.59-xenon',
			'pull': 'always',
			'volumes': [{
				'name': 'uploads',
				'path': '/uploads'
			}],
		}]

	if not isLocalBrowser(browser):
		return [{
			'name': 'saucelabs',
			'image': 'henrrich/docker-sauce-connect:latest',
			'pull': 'if-not-exists',
			'environment': {
				'SAUCE_USERNAME': {
					'from_secret': 'sauce_username'
				},
				'SAUCE_ACCESS_KEY': {
					'from_secret': 'sauce_access_key'
				},
			},
			'commands': [
				'/usr/local/sauce-connect/bin/sc -i %s' % getSaucelabsTunnelName(alternateSuiteName, browser)
			]
		}]

	return []

def phoenixService():
	return [{
		'name': 'phoenix',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'environment': {
			'APACHE_WEBROOT': '/var/www/owncloud/phoenix/dist',
		},
		'commands': [
			'mkdir dist',
			'/usr/local/bin/apachectl -e debug -D FOREGROUND',
		]
	}]

def owncloudService():
	return [{
		'name': 'owncloud',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'environment': {
			'APACHE_WEBROOT': '/var/www/owncloud/server/',
		},
		'command': [
			'/usr/local/bin/apachectl',
			'-e',
			'debug',
			'-D',
			'FOREGROUND'
		]
	}]

def owncloudFederatedService():
	return [{
		'name': 'federated',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'environment': {
			'APACHE_WEBROOT': '/var/www/owncloud/federated/',
		},
		'command': [
			'/usr/local/bin/apachectl',
			'-e',
			'debug',
			'-D',
			'FOREGROUND'
		]
	}]

def getDbName(db):
	return db.split(':')[0]

def getDbUsername(db):
	name = getDbName(db)

	if name == 'oracle':
		return 'system'

	return 'owncloud'

def getDbPassword(db):
	name = getDbName(db)

	if name == 'oracle':
		return 'oracle'

	return 'owncloud'

def getDbRootPassword():
	return 'owncloud'

def getDbDatabase(db):
	name = getDbName(db)

	if name == 'oracle':
		return 'XE'

	return 'owncloud'

def getSaucelabsTunnelName(alternateSuiteName, browser):
	return '${DRONE_BUILD_NUMBER}-acceptance-%s-%s' % (alternateSuiteName, browser)

def getSaucelabsBrowserName(browser):
	if (browser == 'IE11'):
		return 'internet explorer'
	if (browser == 'Edge'):
		return 'MicrosoftEdge'
	return browser

def isLocalBrowser(browser):
	return ((browser == 'chrome') or (browser == 'firefox'))

def installCore(version, db):
	host = getDbName(db)
	dbType = host

	username = getDbUsername(db)
	password = getDbPassword(db)
	database = getDbDatabase(db)

	if host == 'mariadb':
		dbType = 'mysql'

	if host == 'postgres':
		dbType = 'pgsql'

	if host == 'oracle':
		dbType = 'oci'

	stepDefinition = {
		'name': 'install-core',
		'image': 'owncloudci/core',
		'pull': 'always',
		'settings': {
			'version': version,
			'core_path': '/var/www/owncloud/server',
			'db_type': dbType,
			'db_name': database,
			'db_host': host,
			'db_username': username,
			'db_password': password
		}
	}

	return [stepDefinition]

def installFederatedServer(version, db, dbSuffix = '-federated'):
	host = getDbName(db)
	dbType = host

	username = getDbUsername(db)
	password = getDbPassword(db)
	database = getDbDatabase(db) + dbSuffix

	if host == 'mariadb':
		dbType = 'mysql'
	elif host == 'postgres':
		dbType = 'pgsql'
	elif host == 'oracle':
		dbType = 'oci'

	stepDefinition = {
		'name': 'install-federated',
		'image': 'owncloudci/core',
		'pull': 'always',
		'settings': {
			'version': version,
			'core_path': '/var/www/owncloud/federated/',
			'db_type': dbType,
			'db_name': database,
			'db_host': host + dbSuffix,
			'db_username': username,
			'db_password': password
		}
	}
	return [stepDefinition]

def installNPM():
	return [{
		'name': 'npm-install',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'yarn install --frozen-lockfile'
		]
	}]

def lintTest():
	return [{
		'name': 'lint-test',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'yarn run lint'
		]
	}]

def buildPhoenix():
	return [{
		'name': 'build-phoenix',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'yarn dist',
			'cp tests/drone/config.json dist/config.json'
		]
	}]

def buildDockerImage():
	return [{
        'name': 'docker',
        'image': 'plugins/docker:18.09',
        'pull': 'always',
        'settings': {
          'username': {
            'from_secret': 'docker_username',
          },
          'password': {
            'from_secret': 'docker_password',
          },
          'auto_tag': True,
          'repo': 'owncloud/phoenix',
        },
		'when': {
			'event': [
				'push'
			]
		},
	}]

def buildRelease(ctx):
	return [
		{
			'name': 'build-release',
			'image': 'owncloudci/php:7.1',
			'pull': 'always',
			'commands': [
				'cd /var/www/owncloud/phoenix',
				'make -f Makefile.release dist'
			],
		},
		{
			'name': 'build-changelog',
			'image': 'toolhippie/calens:latest',
			'pull': 'always',
			'commands': [
			'calens --version %s -o dist/CHANGELOG.md' % ctx.build.ref.replace("refs/tags/v", "").split("-")[0],
			],
			'when': {
				'ref': [
					'refs/tags/**',
				],
			},
		},
		{
			'name': 'release-to-github',
			'image': 'plugins/github-release:1',
			'pull': 'always',
			'settings': {
				'api_key': {
					'from_secret': 'github_token',
				},
				'files': [
					'release/*',
				],
				'checksum': [
					'md5',
					'sha256'
				],
				'title': ctx.build.ref.replace("refs/tags/", ""),
				'note': 'dist/CHANGELOG.md',
				'overwrite': True,
			},
			'when': {
				'ref': [
					'refs/tags/**',
				],
			}
		},
      ]

def deployStaging():
	return [{
		'name': 'deploy-staging',
		'image': 'drillster/drone-rsync:latest',
		'pull': 'always',
		'settings': {
			'delete': True,
			'hosts': 'pixie.owncloud.systems',
			'port': '22',
			'recursive': True,
			'script': [
				'sudo docker exec phoenix occ maintenance:mode --on',
				'sudo rsync -az --chown=www-data:www-data -r --del --exclude config.json /home/deploy/phoenix/ /var/lib/phoenix/apps/phoenix',
				'sudo docker exec phoenix occ maintenance:mode --off',
				'sudo docker exec phoenix owncloud migrate'
			],
			'source': 'dist/',
			'target': '/home/deploy/phoenix',
			'user': 'deploy'
		},
		'environment': {
			'RSYNC_KEY': {
				'from_secret': 'rsync_key'
			},
		},
		'when': {
			'branch': [
				'master'
			],
			'event': [
				'push'
			]
		},
	}]

def cloneOauth():
	return [{
		'name': 'clone-oauth',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'git clone -b master https://github.com/owncloud/oauth2.git /var/www/owncloud/server/apps/oauth2',
			'cd /var/www/owncloud/server/apps/oauth2',
			'make vendor'
		]
	}]

def setupServerAndApp(logLevel):
	return [{
		'name': 'setup-server-%s' % config['app'],
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/server/',
			'php occ a:e testing',
			'php occ config:system:set trusted_domains 1 --value=owncloud',
			'php occ config:system:set cors.allowed-domains 0 --value=http://phoenix',
			'php occ log:manage --level %s' % logLevel,
			'php occ config:list',
			'php occ a:e oauth2',
			'php occ oauth2:add-client Phoenix Cxfj9F9ZZWQbQZps1E1M0BszMz6OOFq3lxjSuc8Uh4HLEYb9KIfyRMmgY5ibXXrU 930C6aA0U1VhM03IfNiheR2EwSzRi4hRSpcNqIhhbpeSGU6h38xssVfNcGP0sSwQ http://phoenix/oidc-callback.html',
			'php occ config:system:set skeletondirectory --value=/var/www/owncloud/server/apps/testing/data/webUISkeleton',
			'php occ config:system:set dav.enable.tech_preview  --type=boolean --value=true',
			'php occ config:system:set phoenix.baseUrl --value="http://phoenix"',
			'php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool'
		]
	}]

def setupFedServerAndApp(logLevel):
	return [{
		'name': 'setup-fed-server-%s' % config['app'],
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/federated/',
			'php occ a:e testing',
			'php occ config:system:set trusted_domains 2 --value=federated',
			'php occ log:manage --level %s' % logLevel,
			'php occ config:list',
			'php occ config:system:set skeletondirectory --value=/var/www/owncloud/federated/apps/testing/data/webUISkeleton',
			'php occ config:system:set dav.enable.tech_preview  --type=boolean --value=true',
			'php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool'
		]
	}]

def fixPermissions():
	return [{
		'name': 'fix-permissions',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/server',
			'chown www-data * -R'
		]
	}]

def fixPermissionsFederated():
	return [{
		'name': 'fix-permissions-federated',
		'image': 'owncloudci/php:7.1',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/federated',
			'chown www-data * -R'
		]
	}]

def owncloudLog():
	return [{
		'name': 'owncloud-log',
		'image': 'owncloud/ubuntu:16.04',
		'pull': 'always',
		'detach': True,
		'commands': [
			'tail -f /var/www/owncloud/server/data/owncloud.log'
		]
	}]

def owncloudLogFederated():
	return [{
		'name': 'owncloud-federated-log',
		'image': 'owncloud/ubuntu:16.04',
		'pull': 'always',
		'detach': True,
		'commands': [
			'tail -f /var/www/owncloud/federated/data/owncloud.log'
		]
	}]

def copyFilesForUpload():
	return [{
		'name': 'copy-files-for-upload',
		'pull': 'always',
		'image': 'owncloudci/php:7.1',
		'volumes': [{
			'name': 'uploads',
			'path': '/filesForUpload'
		}],
		'commands': [
			'ls -la /filesForUpload',
			'cp -a /var/www/owncloud/phoenix/tests/acceptance/filesForUpload/. /filesForUpload',
			'ls -la /filesForUpload'
		]
	}]

def runWebuiAcceptanceTests(suite, alternateSuiteName, filterTags, extraEnvironment, browser):
	environment = {}
	if (filterTags != ''):
		environment['TEST_TAGS'] = filterTags
	for env in extraEnvironment:
		environment[env] = extraEnvironment[env]
	if isLocalBrowser(browser):
		environment['LOCAL_UPLOAD_DIR'] = '/uploads'
		if (suite != 'all'):
			environment['TEST_CONTEXT'] = suite
	else:
		environment['TEST_CONTEXT'] = suite
		environment['BROWSER_NAME'] = getSaucelabsBrowserName(browser)
		environment['SELENIUM_PORT'] = '4445'
		environment['SAUCELABS_TUNNEL_NAME'] = getSaucelabsTunnelName(alternateSuiteName, browser)
		environment['SAUCE_USERNAME'] = {
			'from_secret': 'sauce_username'
		}
		environment['SAUCE_ACCESS_KEY'] = {
			'from_secret': 'sauce_access_key'
		}

	environment['SERVER_HOST'] = 'http://phoenix'
	environment['BACKEND_HOST'] = 'http://owncloud'
	return [{
		'name': 'webui-acceptance-tests',
		'image': 'owncloudci/nodejs:11',
		'pull': 'always',
		'environment': environment,
		'commands': [
			'cd /var/www/owncloud/phoenix',
			'curl http://phoenix/oidc-callback.html',
			'yarn run acceptance-tests-drone',
		]
	}]

def dependsOn(earlierStages, nextStages):
	for earlierStage in earlierStages:
		for nextStage in nextStages:
			nextStage['depends_on'].append(earlierStage['name'])
