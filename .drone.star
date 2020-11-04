config = {
	'app': 'phoenix',
	'rocketchat': {
		'channel': 'builds',
		'from_secret': 'private_rocketchat'
	},

	'branches': [
		'master',
	],

	'yarnlint': True,

	'acceptance': {
		'webUI': {
			'suites': {
				'webUIBasic': [
					'webUILogin',
					'webUINotifications',
					'webUIPrivateLinks',
					'webUIPreview',
					'webUIAccount',
				],
				'webUICreate': [
					'webUICreateFilesFolders',
				],
				'webUIDelete': [
					'webUIDeleteFilesFolders',
				],
				'webUIRename': [
					'webUIRenameFiles',
					'webUIRenameFolders',
				],
				'webUISharingBasic': [
					'webUISharingAcceptShares',
					'webUISharingAcceptSharesToRoot',
				],
				'webUIRestrictSharing': [
					'webUIRestrictSharing',
				],
				'webUISharingNotifications': [
					'webUISharingNotifications',
					'webUISharingNotificationsToRoot',
				],
				'webUIFavorites': 'Favorites',
				'webUIFiles': 'Files',
				'webUISharingAutocompletion': 'SharingAutocompletion',
				'webUISharingInternalGroups': 'SharingInternalGroups',
				'webUISharingInternalGroupsToRoot': 'SharingInternalGroupsRoot',
				'webUISharingInternalUsers': 'SharingInternalUsers',
				'webUISharingInternalUsersExpire': 'SharingInternalUsersExpire',
				'webUISharingInternalUsersToRoot': 'SharingInternalUsersRoot',
				'webUISharingInternalUsersExpireToRoot': 'SharingInternalUsersExpireToRoot',
				'webUISharingPermissionsUsers': 'SharingPermissionsUsers',
				'webUISharingFilePermissionsGroups': 'SharingFilePermissionsGroups',
				'webUISharingFolderPermissionsGroups': 'SharingFolderPermissionsGroups',
				'webUISharingFolderAdvancedPermissionsGroups': 'SharingFolderAdvPermissionsGrp',
				'webUISharingPermissionToRoot': 'SharingPermissionToRoot',
				'webUIResharing': 'Resharing',
				'webUIResharingToRoot': 'ResharingToRoot',
				'webUISharingPublic': 'SharingPublic',
				'webUISharingPublicExpire': 'SharingPublicExpire',
				'webUISharingPublicDifferentRoles': 'SharingPublicDifferentRoles',
				'webUITrashbin': 'Trashbin',
				'webUITrashbinFilesFolders': 'TrashbinFilesFolders',
				'webUITrashbinRestore': 'TrashbinRestore',
				'webUIUpload': 'Upload',
				'webUISharingFilePermissionMultipleUsers': 'SharingFilePermissionMultipleUsers',
				'webUISharingFolderPermissionMultipleUsers': 'SharingFolderPermissionMultipleUsers',
				'webUISharingFolderAdvancedPermissionMultipleUsers': 'SharingFolderAdvancedPermissionMU',
				'webUIMoveFilesFolders': 'Move',
			},
			'extraEnvironment': {
				'OPENID_LOGIN': 'true',
				'PHOENIX_CONFIG': '/srv/config/drone/config.json'
			}
		},
		'webUIFederation': {
			'suites': {
				'webUISharingExternal': 'SharingExternal',
				'webUISharingExternalToRoot': 'SharingExternalRoot',
			},
			'extraEnvironment': {
				'OPENID_LOGIN': 'true',
				'REMOTE_BACKEND_HOST': 'http://federated'
			},
			'federatedServerNeeded': True,
			'federatedServerVersion': 'daily-master-qa'
		},
		'webUI-XGA': {
			'suites': {
				'XGAPortrait1': [
					'webUILogin',
					'webUINotifications',
					'webUIPrivateLinks',
					'webUIPreview',
					'webUIAccount',
					'webUICreateFilesFolders',
					'webUICreateFilesFolders',
					'webUIRenameFiles',
					'webUIRenameFolders',
					'webUISharingAcceptShares',
					'webUISharingAcceptSharesToRoot',
					'webUIRestrictSharing',
					'webUISharingNotifications',
					'webUISharingNotificationsToRoot',
					'webUIFavorites',
					'webUIFiles',
					],
				'XGAPortrait2': [
					'webUISharingAutocompletion',
					'webUISharingInternalGroups',
					'webUISharingInternalGroupsToRoot',
					'webUISharingInternalUsers',
					'webUISharingInternalUsersExpire',
					'webUISharingInternalUsersToRoot',
					'webUISharingInternalUsersExpireToRoot',
					'webUISharingPermissionsUsers',
					'webUISharingFilePermissionsGroups',
					'webUISharingFolderPermissionsGroups',
					'webUISharingFolderAdvancedPermissionsGroups',
					'webUISharingPermissionToRoot',
					'webUIResharing',
					'webUIResharingToRoot',
					'webUISharingPublic',
					'webUISharingPublicExpire',
					'webUISharingPublicDifferentRoles',
					'webUITrashbin',
					'webUITrashbinFilesFolders',
					'webUITrashbinRestore',
					'webUIUpload',
					'webUISharingFilePermissionMultipleUsers',
					'webUISharingFolderPermissionMultipleUsers',
					'webUISharingFolderAdvancedPermissionMultipleUsers',
					'webUIMoveFilesFolders',
				]
			},
			'extraEnvironment': {
				'OPENID_LOGIN': 'true',
				'SCREEN_RESOLUTION': '768x1024'
			},
			'filterTags': '@smokeTest and not @skipOnXGAPortraitResolution and not @skip and not @skipOnOC10'
		},
		'webUI-iPhone': {
			'suites': {
				'iPhone1': [
					'webUILogin',
					'webUINotifications',
					'webUIPrivateLinks',
					'webUIPreview',
					'webUIAccount',
					'webUICreateFilesFolders',
					'webUICreateFilesFolders',
					'webUIRenameFiles',
					'webUIRenameFolders',
					'webUISharingAcceptShares',
					'webUISharingAcceptSharesToRoot',
					'webUIRestrictSharing',
					'webUISharingNotifications',
					'webUISharingNotificationsToRoot',
					'webUIFavorites',
					'webUIFiles',
					],
				'iPhone2': [
					'webUISharingAutocompletion',
					'webUISharingInternalGroups',
					'webUISharingInternalGroupsToRoot',
					'webUISharingInternalUsers',
					'webUISharingInternalUsersExpire',
					'webUISharingInternalUsersToRoot',
					'webUISharingInternalUsersExpireToRoot',
					'webUISharingPermissionsUsers',
					'webUISharingFilePermissionsGroups',
					'webUISharingFolderPermissionsGroups',
					'webUISharingFolderAdvancedPermissionsGroups',
					'webUISharingPermissionToRoot',
					'webUIResharing',
					'webUIResharingToRoot',
					'webUISharingPublic',
					'webUISharingPublicExpire',
					'webUISharingPublicDifferentRoles',
					'webUITrashbin',
					'webUITrashbinFilesFolders',
					'webUITrashbinRestore',
					'webUIUpload',
					'webUISharingFilePermissionMultipleUsers',
					'webUISharingFolderPermissionMultipleUsers',
					'webUISharingFolderAdvancedPermissionMultipleUsers',
					'webUIMoveFilesFolders',
				]
			},
			'extraEnvironment': {
				'OPENID_LOGIN': 'true',
				'SCREEN_RESOLUTION': '375x812'
			},
			'filterTags': '@smokeTest and not @skipOnIphoneResolution and not @skip and not @skipOnOC10'
		},
		'webUI-ocis': {
			'suites': {
				'webUIOCISBasic': [
					'webUILogin',
					'webUINotifications',
					'webUIPrivateLinks',
					'webUIPreview',
					'webUIAccount',
				],
				'webUIOCISCreate': [
					'webUICreateFilesFolders',
				],
				'webUIOCISDelete': [
					'webUIDeleteFilesFolders',
				],
				'webUIOCISRename': [
					'webUIRenameFiles',
					'webUIRenameFolders',
				],
				'webUIOCISSharingBasic': [
					'webUISharingAcceptShares',
					'webUISharingAcceptSharesToRoot',
				],
				'webUIOCISRestrictSharing': [
					'webUIRestrictSharing',
				],
				'webUIOCISSharingNotifications': [
					'webUISharingNotifications',
					'webUISharingNotificationsToRoot',
				],
				'webUIFavorites': 'OCISFavorites',
				'webUIFiles': 'OCISFiles',
				'webUISharingAutocompletion': 'OCISSharingAutocompletion',
				'webUISharingInternalGroups': 'OCISSharingInternalGroups',
				'webUISharingInternalGroupsToRoot': 'OCISSharingInternalGroupsRoot',
				'webUISharingInternalUsers': 'OCISSharingInternalUsers',
				'webUISharingInternalUsersExpire': 'OCISSharingInternalUsersExpire',
				'webUISharingInternalUsersToRoot': 'OCISSharingInternalUsersRoot',
				'webUISharingInternalUsersExpireToRoot': 'OCISSharingInternalUsersExpireToRoot',
				'webUISharingPermissionsUsers': 'OCISSharingPermissionsUsers',
				'webUISharingFilePermissionsGroups': 'OCISSharingFilePermissionsGroups',
				'webUISharingFolderPermissionsGroups': 'OCISSharingFolderPermissionsGroups',
				'webUISharingFolderAdvancedPermissionsGroups': 'OCISSharingFolderAdvPermissionsGrp',
				'webUISharingPermissionToRoot': 'OCISSharingPermissionToRoot',
				'webUIResharing': 'OCISResharing', # for now run this suite by itself see https://github.com/owncloud/ocis/issues/736
				'webUIResharingToRoot': 'OCISResharingToRoot',
				'webUISharingPublic': 'OCISSharingPublic',
				'webUISharingPublicExpire': 'OCISSharingPublicExpire',
				'webUISharingPublicDifferentRoles': 'OCISSharingPublicDifferentRoles',
				'webUITrashbin': 'OCISTrashbin',
				'webUITrashbinFilesFolders': 'OCISTrashbinFilesFolders',
				'webUITrashbinRestore': 'OCISTrashbinRestore',
				'webUIUpload': 'OCISUpload',
				'webUISharingFilePermissionMultipleUsers': 'OCISSharingFilePermissionMultipleUsers',
				'webUISharingFolderPermissionMultipleUsers': 'OCISSharingFolderPermissionMultipleUsers',
				'webUISharingFolderAdvancedPermissionMultipleUsers': 'OCISSharingFolderAdvancedPermissionMU',
				'webUIMoveFilesFolders': 'OCISMove',
			},
			'extraEnvironment': {
				'NODE_TLS_REJECT_UNAUTHORIZED': '0',
				'SERVER_HOST': 'https://ocis:9200',
				'BACKEND_HOST': 'https://ocis:9200',
				'RUN_ON_OCIS': 'true',
				'OCIS_SKELETON_DIR': '/srv/app/testing/data/webUISkeleton',
				'OCIS_REVA_DATA_ROOT': '/srv/app/tmp/ocis/owncloud/data/',
				'PHOENIX_CONFIG': '/srv/config/drone/ocis-config.json'
			},
			'runningOnOCIS': True,
			'filterTags': 'not @skip and not @skipOnOCIS',
		}
	},

	'defaults': {
		'acceptance': {
			'ocisBranch': 'master',
			'ocisCommit': '2255eed422c59c9ff7c65daf8952929607e2fffe',
		},
	},

	'trigger': {
		'ref': [
			'refs/tags/**',
			'refs/pull/**',
		]
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

	after = afterPipelines(ctx)
	dependsOn(stages, after)

	return before + stages + after

def beforePipelines(ctx):
	return yarnlint() + changelog(ctx) + website(ctx)

def stagePipelines(ctx):
	acceptancePipelines = acceptance()
	if acceptancePipelines == False:
		return False

	return acceptancePipelines

def afterPipelines(ctx):
	return build(ctx) + notify()

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
			'ref': list(config['trigger']['ref'])
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
		'name': 'build',
		'workspace' : {
			'base': '/var/www/owncloud',
			'path': config['app']
		},
		'steps':
			installNPM() +
			buildRelease(ctx) +
			buildDockerImage(),
		'depends_on': [],
		'trigger': config['trigger']
	}

	pipelines.append(result)

	return pipelines

def changelog(ctx):
	pipelines = []
	repo_slug = ctx.build.source_repo if ctx.build.source_repo else ctx.repo.slug

	result = {
		'kind': 'pipeline',
		'type': 'docker',
		'name': 'changelog',
		'clone': {
			'disable': True,
		},
		'steps': [
			{
				'name': 'clone',
				'image': 'plugins/git-action:1',
				'pull': 'always',
				'settings': {
					'actions': [
						'clone',
					],
					'remote': 'https://github.com/%s' % (repo_slug),
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
		'trigger': config['trigger']
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
		'filterTags': 'not @skip and not @skipOnOC10',
		'logLevel': '2',
		'federatedServerNeeded': False,
		'federatedServerVersion': '',
		'runningOnOCIS': False,
		'screenShots': False,
		'ocisBranch': 'master',
		'ocisCommit': '',
	}

	if 'defaults' in config:
		if 'acceptance' in config['defaults']:
			for item in config['defaults']['acceptance']:
				default[item] = config['defaults']['acceptance'][item]

	if (default['screenShots']):
		default['extraEnvironment'].update({"SCREENSHOTS": "true"})

	for category, matrix in config['acceptance'].items():
		if type(matrix['suites']) == "list":
			suites = {}
			for suite in matrix['suites']:
				suites[suite] = suite
		else:
			suites = matrix['suites']

		for key, value in suites.items():

			if type(value) == "list":
				suite = value
				suiteName = key
				alternateSuiteName = key
			else:
				suite = key
				alternateSuiteName = value
				suiteName = value

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
						name = '%s%s' % (suiteName, browserString)
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
								cloneOCIS(params['ocisBranch']) +
								(
									(
										installCore(server, db) +
										owncloudLog() +
										setupServerAndApp(params['logLevel']) +
										(
											installFederatedServer(federatedServerVersion, db, federationDbSuffix) +
											setupFedServerAndApp(params['logLevel']) +
											fixPermissionsFederated() +
											owncloudLogFederated() if params['federatedServerNeeded'] else []
										) +
										setupGraphapiOIdC() +
										buildGlauth() +
										buildKonnectd() +
										buildOcisPhoenix() +
										konnectdService() +
										ocisPhoenixService() +
										glauthService()+
										fixPermissions()
									) if not params['runningOnOCIS'] else (
										buildOCIS(params['ocisCommit']) +
										ocisService() +
										getSkeletonFiles()
									)
								) +
								copyFilesForUpload() +
								runWebuiAcceptanceTests(suite, alternateSuiteName, params['filterTags'], params['extraEnvironment'], browser) +
								(
									uploadScreenshots() +
									buildGithubComment(suiteName, alternateSuiteName) +
									githubComment()
								if isLocalBrowser(browser) and params['screenShots'] else []),
							'services':
								( redisService() if params['runningOnOCIS'] else []) +
								browserService(alternateSuiteName, browser) +
								(
									databaseService(db) +
									(
										owncloudFederatedService() +
										databaseServiceForFederation(db, federationDbSuffix) if params['federatedServerNeeded'] else []
									) +
									owncloudService()
								if not params['runningOnOCIS'] else []
								),
							'depends_on': [],
							'trigger': {
								'ref': list(config['trigger']['ref'])
							},
							'volumes': [{
								'name': 'uploads',
								'temp': {}
							}, {
								'name': 'configs',
								'temp': {}
							}, {
								'name': 'gopath',
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
	pipelines = []

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

	pipelines.append(result)

	return pipelines

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
			'image': 'selenium/standalone-chrome-debug:3.141.59-20200326',
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

def owncloudService():
	return [{
		'name': 'owncloud',
		'image': 'owncloudci/php:7.3',
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
		'image': 'owncloudci/php:7.3',
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
		'image': 'owncloudci/nodejs:11',
		'pull': 'always',
		'commands': [
			'yarn install --frozen-lockfile'
		]
	}]

def lintTest():
	return [{
		'name': 'lint-test',
		'image': 'owncloudci/nodejs:11',
		'pull': 'always',
		'commands': [
			'yarn run lint'
		]
	}]

def buildPhoenix():
	return [{
		'name': 'build-phoenix',
		'image': 'owncloudci/nodejs:11',
		'pull': 'always',
		'commands': [
			'yarn dist',
			'cp tests/drone/config.json dist/config.json',
			'mkdir -p /srv/config',
			'cp -r /var/www/owncloud/phoenix/tests/drone /srv/config',
			'ls -la /srv/config/drone'
		],
		'volumes': [{
			'name': 'configs',
			'path': '/srv/config'
		}],
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
			'name': 'make',
			'image': 'owncloudci/nodejs:11',
			'pull': 'always',
			'commands': [
				'cd /var/www/owncloud/phoenix',
				'make -f Makefile.release'
			],
		},
		{
			'name': 'changelog',
			'image': 'toolhippie/calens:latest',
			'pull': 'always',
			'commands': [
			'calens --version %s -o dist/CHANGELOG.md -t changelog/CHANGELOG-Release.tmpl' % ctx.build.ref.replace("refs/tags/v", "").split("-")[0],
			],
			'when': {
				'ref': [
					'refs/tags/**',
				],
			},
		},
		{
			'name': 'publish',
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
				'title': ctx.build.ref.replace("refs/tags/v", ""),
				'note': 'dist/CHANGELOG.md',
				'overwrite': True,
			},
			'when': {
				'ref': [
					'refs/tags/**',
				],
			}
		}
	]

def website(ctx):
  return [
	{
		'kind': 'pipeline',
		'type': 'docker',
		'name': 'website',
		'platform': {
			'os': 'linux',
			'arch': 'amd64',
		},
		'steps': [
			{
				'name': 'prepare',
				'image': 'owncloudci/alpine:latest',
				'commands': [
				'	make docs-copy'
				],
			},
			{
				'name': 'test',
				'image': 'webhippie/hugo:latest',
				'commands': [
					'cd hugo',
				'	hugo',
				],
			},
			{
				'name': 'list',
				'image': 'owncloudci/alpine:latest',
				'commands': [
					'tree hugo/public',
				],
			},
			{
				'name': 'publish',
				'image': 'plugins/gh-pages:1',
				'pull': 'always',
				'settings': {
					'username': {
						'from_secret': 'github_username',
					},
					'password': {
						'from_secret': 'github_token',
					},
					'pages_directory': 'docs/',
					'target_branch': 'docs',
				},
				'when': {
					'ref': {
						'exclude': [
						'refs/pull/**',
						],
					},
				},
			},
			{
				'name': 'downstream',
				'image': 'plugins/downstream',
				'settings': {
					'server': 'https://cloud.drone.io/',
					'token': {
						'from_secret': 'drone_token_cloud',
					},
					'repositories': [
						'owncloud/owncloud.github.io@source',
						],
					},
				'when': {
					'ref': {
						'exclude': [
						'refs/pull/**',
						],
					},
				},
			},
		],
		'depends_on': [],
		'trigger': config['trigger'],
	}
  ]

def getSkeletonFiles():
	return [{
		'name': 'setup-skeleton-files',
		'image': 'owncloudci/php:7.3',
		'pull': 'always',
		'commands': [
			'git clone https://github.com/owncloud/testing.git /srv/app/testing',
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}],
	}]

def setupGraphapiOIdC():
	return [{
		'name': 'setup-graphapi',
		'image': 'owncloudci/php:7.3',
		'pull': 'always',
		'commands': [
			'git clone -b master https://github.com/owncloud/graphapi.git /var/www/owncloud/server/apps/graphapi',
			'cd /var/www/owncloud/server/apps/graphapi',
			'make vendor',
			'git clone -b master https://github.com/owncloud/openidconnect.git /var/www/owncloud/server/apps/openidconnect',
			'cd /var/www/owncloud/server/apps/openidconnect',
			'make vendor',
			'cd /var/www/owncloud/server/',
			'php occ a:e graphapi',
			'php occ a:e openidconnect',
			'php occ config:system:set trusted_domains 2 --value=phoenix',
			'php occ config:system:set openid-connect provider-url --value="https://konnectd:9130"',
			'php occ config:system:set openid-connect loginButtonName --value=OpenId-Connect',
			'php occ config:system:set openid-connect client-id --value=phoenix',
			'php occ config:system:set openid-connect insecure --value=true --type=bool',
			'php occ config:system:set cors.allowed-domains 0 --value="http://phoenix:9100"',
			'php occ config:system:set memcache.local --value="\\\\OC\\\\Memcache\\\\APCu"',
			'php occ config:system:set phoenix.baseUrl --value="http://phoenix:9100"',
			'php occ config:list'
		]
	}]

def buildGlauth():
	return[{
		'name': 'build-glauth',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'commands': [
      # using ocis-glauth repo because latest glauth doesn't supports the bridge setup
			'mkdir -p /srv/app/src',
			'cd $GOPATH/src',
			'mkdir -p github.com/owncloud/',
			'cd github.com/owncloud/',
			'git clone http://github.com/owncloud/ocis-glauth',
			'cd ocis-glauth',
			'git checkout 44e252306af2dedd72ad00567bbfe9c03322ab20',
			'make build',
			'cp bin/ocis-glauth /var/www/owncloud'
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def glauthService():
	return[{
		'name': 'glauth',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'detach': True,
		'environment' : {
			'GLAUTH_BACKEND_DATASTORE': 'owncloud',
			'GLAUTH_BACKEND_BASEDN': 'dc=example,dc=com',
		},
		'commands': [
			'cd /var/www/owncloud',
			'./ocis-glauth --log-level debug server --backend-server http://owncloud/'
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def buildKonnectd():
	return[{
		'name': 'build-konnectd',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'commands': [
			'cd $GOPATH/src/github.com/owncloud/ocis',
			'cd konnectd',
			'make build',
			'cp bin/konnectd /var/www/owncloud'
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def konnectdService():
	return[{
		'name': 'konnectd',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'detach': True,
		'environment' : {
			'LDAP_BASEDN': 'dc=example,dc=com',
			'LDAP_BINDDN': 'cn=admin,ou=users,dc=example,dc=com',
			'LDAP_URI': 'ldap://glauth:9125',
			'KONNECTD_IDENTIFIER_REGISTRATION_CONF': '/srv/config/drone/identifier-registration-oc10.yml',
			'KONNECTD_ISS': 'https://konnectd:9130',
			'KONNECTD_TLS': 'true',
			'LDAP_BINDPW': 'admin',
			'LDAP_SCOPE': 'sub',
			'LDAP_LOGIN_ATTRIBUTE': 'uid',
			'LDAP_EMAIL_ATTRIBUTE': 'mail',
			'LDAP_NAME_ATTRIBUTE': 'givenName',
			'LDAP_UUID_ATTRIBUTE': 'uid',
			'LDAP_UUID_ATTRIBUTE_TYPE': 'text',
			'LDAP_FILTER': "(objectClass=posixaccount)"
		},
		'commands': [
			'cd /var/www/owncloud',
			'./konnectd  --log-level debug server --signing-kid gen1-2020-02-27',
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def cloneOCIS(ocisBranch):
	return[{
		'name': 'clone-ocis',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'commands': [
			'mkdir -p /srv/app/src',
			'cd $GOPATH/src',
			'mkdir -p github.com/owncloud/',
			'cd github.com/owncloud/',
			'git clone -b %s --single-branch --no-tags https://github.com/owncloud/ocis' % (ocisBranch),
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def buildOCIS(ocisCommit):
	return[{
		'name': 'build-ocis',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'commands': [
			'cd $GOPATH/src/github.com/owncloud/ocis',
		] + ([
			'git checkout %s' % (ocisCommit)
		] if ocisCommit != '' else []) + [
			'cd ocis',
			'make build',
			'cp bin/ocis /var/www/owncloud'
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def ocisService():
	return[{
		'name': 'ocis',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'detach': True,
		'environment' : {
			'STORAGE_HOME_DRIVER': 'owncloud',
			'STORAGE_USERS_DRIVER': 'owncloud',
			'STORAGE_STORAGE_OCIS_ROOT': '/srv/app/tmp/ocis/storage/users',
			'STORAGE_STORAGE_LOCAL_ROOT': '/srv/app/tmp/ocis/local/root',
			'STORAGE_STORAGE_OWNCLOUD_DATADIR': '/srv/app/tmp/ocis/owncloud/data',
			'STORAGE_METADATA_ROOT': '/srv/app/tmp/ocis/metadata',
			'STORAGE_STORAGE_OWNCLOUD_REDIS_ADDR': 'redis:6379',
			'STORAGE_LDAP_IDP': 'https://ocis:9200',
			'STORAGE_OIDC_ISSUER': 'https://ocis:9200',
			'PROXY_OIDC_ISSUER': 'https://ocis:9200',
			'PROXY_OIDC_INSECURE': 'true',
			'STORAGE_HOME_DATA_SERVER_URL': 'http://ocis:9155/data',
			'STORAGE_DATAGATEWAY_PUBLIC_URL': 'https://ocis:9200/data',
			'STORAGE_USERS_DATA_SERVER_URL': 'http://ocis:9158/data',
			'STORAGE_FRONTEND_PUBLIC_URL': 'https://ocis:9200',
			'PHOENIX_WEB_CONFIG': '/srv/config/drone/ocis-config.json',
			'PHOENIX_ASSET_PATH': '/var/www/owncloud/phoenix/dist',
			'KONNECTD_IDENTIFIER_REGISTRATION_CONF': '/srv/config/drone/identifier-registration.yml',
			'KONNECTD_ISS': 'https://ocis:9200',
			'KONNECTD_TLS': 'true',
			'ACCOUNTS_DATA_PATH': '/srv/app/tmp/ocis-accounts/',
		},
		'commands': [
			'cd /var/www/owncloud',
			'mkdir -p /srv/app/tmp/ocis/owncloud/data/',
			'mkdir -p /srv/app/tmp/ocis/storage/users/',
			'./ocis --log-level debug server'
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def buildOcisPhoenix():
	return[{
		'name': 'build-ocis-phoenix',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'commands': [
			'cd $GOPATH/src/github.com/owncloud/ocis',
			'cd ocis-phoenix',
			'make build',
			'cp bin/ocis-phoenix /var/www/owncloud'
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

# Ocis-phoenix service just for the oc10 tests
def ocisPhoenixService():
	return[{
		'name': 'phoenix',
		'image': 'webhippie/golang:1.13',
		'pull': 'always',
		'detach': True,
		'environment' : {
			'PHOENIX_WEB_CONFIG': '/srv/config/drone/config.json',
			'PHOENIX_ASSET_PATH': '/var/www/owncloud/phoenix/dist',
			'PHOENIX_OIDC_CLIENT_ID': 'phoenix'
		},
		'commands': [
			'cd /var/www/owncloud',
			'./ocis-phoenix --log-level debug server',
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		}, {
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def setupServerAndApp(logLevel):
	return [{
		'name': 'setup-server-%s' % config['app'],
		'image': 'owncloudci/php:7.3',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/server/',
			'php occ a:e testing',
			'php occ config:system:set trusted_domains 1 --value=owncloud',
			'php occ config:system:set cors.allowed-domains 0 --value=http://phoenix',
			'php occ log:manage --level %s' % logLevel,
			'php occ config:list',
			'php occ config:system:set skeletondirectory --value=/var/www/owncloud/server/apps/testing/data/webUISkeleton',
			'php occ config:system:set dav.enable.tech_preview  --type=boolean --value=true',
			'php occ config:system:set phoenix.baseUrl --value="http://phoenix"',
			'php occ config:system:set sharing.federation.allowHttpFallback --value=true --type=bool'
		]
	}]

def setupFedServerAndApp(logLevel):
	return [{
		'name': 'setup-fed-server-%s' % config['app'],
		'image': 'owncloudci/php:7.3',
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
		'image': 'owncloudci/php:7.3',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/server',
			'chown www-data * -R'
		]
	}]

def fixPermissionsFederated():
	return [{
		'name': 'fix-permissions-federated',
		'image': 'owncloudci/php:7.3',
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
		'image': 'owncloudci/php:7.3',
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
	if isLocalBrowser(browser):
		environment['LOCAL_UPLOAD_DIR'] = '/uploads'
		if type(suite) == "list":
			paths = ""
			for path in suite:
				paths = paths + "tests/acceptance/features/" + path + " "
			environment['TEST_PATHS'] = paths
		elif (suite != 'all'):
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

	environment['SERVER_HOST'] = 'http://phoenix:9100'
	environment['BACKEND_HOST'] = 'http://owncloud'

	for env in extraEnvironment:
		environment[env] = extraEnvironment[env]

	return [{
		'name': 'webui-acceptance-tests',
		'image': 'owncloudci/nodejs:11',
		'pull': 'always',
		'environment': environment,
		'commands': [
			'cd /var/www/owncloud/phoenix',
			'yarn run acceptance-tests-drone',
		],
		'volumes': [{
			'name': 'gopath',
			'path': '/srv/app',
		},{
			'name': 'configs',
			'path': '/srv/config'
		}],
	}]

def redisService():
	return[{
		'name': 'redis',
		'image': 'webhippie/redis',
		'pull': 'always',
		'environment': {
			'REDIS_DATABASES': 1
		},
	}]

def uploadScreenshots():
	return [{
		'name': 'upload-screenshots',
		'image': 'plugins/s3',
		'pull': 'if-not-exists',
		'settings': {
			'acl': 'public-read',
			'bucket': 'phoenix',
			'endpoint': 'https://minio.owncloud.com/',
			'path_style': True,
			'source': '/var/www/owncloud/phoenix/tests/reports/screenshots/**/*',
			'strip_prefix': '/var/www/owncloud/phoenix/tests/reports/screenshots',
			'target': '/screenshots/${DRONE_BUILD_NUMBER}',
		},
		'environment': {
			'AWS_ACCESS_KEY_ID': {
				'from_secret': 'aws_access_key_id'
			},
			'AWS_SECRET_ACCESS_KEY': {
				'from_secret': 'aws_secret_access_key'
			},
		},
		'when': {
			'status': [
				'failure'
			],
			'event': [
				'pull_request'
			]
		},
	}]

def buildGithubComment(suite, alternateSuiteName):
	return [{
		'name': 'build-github-comment',
		'image': 'owncloud/ubuntu:16.04',
		'pull': 'always',
		'commands': [
			'cd /var/www/owncloud/phoenix/tests/reports/screenshots/',
			'echo "<details><summary>:boom: Acceptance tests <strong>%s</strong> failed. Please find the screenshots inside ...</summary>\\n\\n${DRONE_BUILD_LINK}/${DRONE_JOB_NUMBER}\\n\\n<p>\\n\\n" >> comments.file' % alternateSuiteName,
			'for f in *.png; do echo \'!\'"[$f](https://minio.owncloud.com/phoenix/screenshots/${DRONE_BUILD_NUMBER}/$f)" >> comments.file; done',
			'echo "\n</p></details>" >> comments.file',
			'more comments.file',
		],
		'environment': {
			'TEST_CONTEXT': suite,
		},
		'when': {
			'status': [
				'failure'
			],
			'event': [
				'pull_request'
			]
		},
	}]

def githubComment():
	return [{
		'name': 'github-comment',
		'image': 'jmccann/drone-github-comment:1',
		'pull': 'if-not-exists',
		'settings': {
			'message_file': '/var/www/owncloud/phoenix/tests/reports/screenshots/comments.file',
		},
		'environment': {
			'PLUGIN_API_KEY': {
				'from_secret': 'plugin_api_key'
			},
		},
		'when': {
			'status': [
				'failure'
			],
			'event': [
				'pull_request'
			]
		},
	}]

def dependsOn(earlierStages, nextStages):
	for earlierStage in earlierStages:
		for nextStage in nextStages:
			nextStage['depends_on'].append(earlierStage['name'])
