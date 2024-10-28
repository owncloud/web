ALPINE_GIT = "alpine/git:latest"
APACHE_TIKA = "apache/tika:2.8.0.0"
COLLABORA_CODE = "collabora/code:24.04.5.1.1"
CS3ORG_WOPI_SERVER = "cs3org/wopiserver:v10.3.0"
KEYCLOAK = "quay.io/keycloak/keycloak:24.0.1"
MINIO_MC = "minio/mc:RELEASE.2021-10-07T04-19-58Z"
OC_CI_ALPINE = "owncloudci/alpine:latest"
OC_CI_BAZEL_BUILDIFIER = "owncloudci/bazel-buildifier"
OC_CI_DRONE_ANSIBLE = "owncloudci/drone-ansible:latest"
OC_CI_DRONE_SKIP_PIPELINE = "owncloudci/drone-skip-pipeline"
OC_CI_GOLANG = "owncloudci/golang:1.22"
OC_CI_HUGO = "owncloudci/hugo:0.115.2"
OC_CI_NODEJS = "owncloudci/nodejs:20"
OC_CI_WAIT_FOR = "owncloudci/wait-for:latest"
OC_UBUNTU = "owncloud/ubuntu:20.04"
ONLYOFFICE_DOCUMENT_SERVER = "onlyoffice/documentserver:8.1.3"
PLUGINS_DOCKER = "plugins/docker:20.14"
PLUGINS_GH_PAGES = "plugins/gh-pages:1"
PLUGINS_GIT_ACTION = "plugins/git-action:1"
PLUGINS_GITHUB_RELEASE = "plugins/github-release:1"
PLUGINS_S3 = "plugins/s3:1.4.0"
PLUGINS_S3_CACHE = "plugins/s3-cache:1"
PLUGINS_SLACK = "plugins/slack:1"
POSTGRES_ALPINE = "postgres:alpine3.18"
SONARSOURCE_SONAR_SCANNER_CLI = "sonarsource/sonar-scanner-cli:5.0"
TOOLHIPPIE_CALENS = "toolhippie/calens:latest"

WEB_PUBLISH_NPM_PACKAGES = ["babel-preset", "design-system", "eslint-config", "extension-sdk", "prettier-config", "tsconfig", "web-client", "web-pkg", "web-test-helpers"]
WEB_PUBLISH_NPM_ORGANIZATION = "@ownclouders"

dir = {
    "base": "/var/www/owncloud",
    "web": "/var/www/owncloud/web",
    "ocis": "/var/www/owncloud/ocis",
    "commentsFile": "/var/www/owncloud/web/comments.file",
    "app": "/srv/app",
    "ocisConfig": "/var/www/owncloud/web/tests/drone/config-ocis.json",
    "ocisIdentifierRegistrationConfig": "/var/www/owncloud/web/tests/drone/identifier-registration.yml",
    "ocisRevaDataRoot": "/srv/app/tmp/ocis/owncloud/data/",
    "federatedOcisConfig": "/var/www/owncloud/web/tests/drone/config-ocis-federated.json",
    "ocmProviders": "/var/www/owncloud/web/tests/drone/providers.json",
}

config = {
    "app": "web",
    "rocketchat": {
        "channel": "builds",
        "from_secret": "rocketchat_talk_webhook",
    },
    "branches": [
        "master",
        "stable-*",
    ],
    "pnpmlint": True,
    "e2e": {
        "1": {
            "earlyFail": True,
            "skip": False,
            "suites": [
                "journeys",
                "smoke",
            ],
        },
        "2": {
            "earlyFail": True,
            "skip": False,
            "suites": [
                "admin-settings",
                "spaces",
            ],
        },
        "3": {
            "earlyFail": True,
            "skip": False,
            "tikaNeeded": True,
            "suites": [
                "search",
                "shares",
            ],
            "extraServerEnvironment": {
                "FRONTEND_FULL_TEXT_SEARCH_ENABLED": True,
                "SEARCH_EXTRACTOR_TYPE": "tika",
                "SEARCH_EXTRACTOR_TIKA_TIKA_URL": "http://tika:9998",
                "SEARCH_EXTRACTOR_CS3SOURCE_INSECURE": True,
            },
        },
        "4": {
            "earlyFail": True,
            "skip": False,
            "suites": [
                "navigation",
                "user-settings",
                "file-action",
            ],
        },
        "app-provider": {
            "skip": False,
            "suites": [
                "app-provider",
            ],
            "extraServerEnvironment": {
                "GATEWAY_GRPC_ADDR": "0.0.0.0:9142",
                "MICRO_REGISTRY": "nats-js-kv",
                "MICRO_REGISTRY_ADDRESS": "0.0.0.0:9233",
                "NATS_NATS_HOST": "0.0.0.0",
                "NATS_NATS_PORT": 9233,
                "COLLABORA_DOMAIN": "collabora:9980",
                "ONLYOFFICE_DOMAIN": "onlyoffice:443",
                "FRONTEND_APP_HANDLER_SECURE_VIEW_APP_ADDR": "com.owncloud.api.collaboration.Collabora",
                "WEB_UI_CONFIG_FILE": None,
            },
        },
        "oidc-refresh-token": {
            "skip": False,
            "features": [
                "cucumber/features/oidc/refreshToken.feature",
            ],
            "extraServerEnvironment": {
                "IDP_ACCESS_TOKEN_EXPIRATION": 30,
                "WEB_OIDC_SCOPE": "openid profile email offline_access",
            },
        },
        "oidc-iframe": {
            "skip": False,
            "features": [
                "cucumber/features/oidc/iframeTokenRenewal.feature",
            ],
            "extraServerEnvironment": {
                "IDP_ACCESS_TOKEN_EXPIRATION": 30,
            },
        },
        "ocm": {
            "earlyFail": True,
            "skip": False,
            "federationServer": True,
            "suites": [
                "ocm",
            ],
            "extraServerEnvironment": {
                "GATEWAY_GRPC_ADDR": "0.0.0.0:9142",
                "MICRO_REGISTRY": "nats-js-kv",
                "MICRO_REGISTRY_ADDRESS": "0.0.0.0:9233",
                "NATS_NATS_HOST": "0.0.0.0",
                "NATS_NATS_PORT": 9233,
                "COLLABORA_DOMAIN": "collabora:9980",
                "FRONTEND_APP_HANDLER_SECURE_VIEW_APP_ADDR": "com.owncloud.api.collaboration.Collabora",
                "OCIS_ADD_RUN_SERVICES": "ocm",
                "OCIS_ENABLE_OCM": True,
                "GRAPH_INCLUDE_OCM_SHAREES": True,
                "OCM_OCM_INVITE_MANAGER_INSECURE": True,
                "OCM_OCM_SHARE_PROVIDER_INSECURE": True,
                "OCM_OCM_STORAGE_PROVIDER_INSECURE": True,
                "OCM_OCM_PROVIDER_AUTHORIZER_PROVIDERS_FILE": "%s" % dir["ocmProviders"],
            },
        },
    },
    "build": True,
}

# minio mc environment variables
minio_mc_environment = {
    "CACHE_BUCKET": {
        "from_secret": "cache_s3_bucket",
    },
    "MC_HOST": {
        "from_secret": "cache_s3_server",
    },
    "AWS_ACCESS_KEY_ID": {
        "from_secret": "cache_s3_access_key",
    },
    "AWS_SECRET_ACCESS_KEY": {
        "from_secret": "cache_s3_secret_key",
    },
}

go_step_volumes = [{
    "name": "server",
    "path": dir["app"],
}, {
    "name": "gopath",
    "path": "/go",
}]

web_workspace = {
    "base": dir["base"],
    "path": config["app"],
}

def main(ctx):
    before = beforePipelines(ctx)

    stages = pipelinesDependsOn(stagePipelines(ctx), before)

    if (stages == False):
        print("Errors detected. Review messages above.")
        return []

    after = pipelinesDependsOn(afterPipelines(ctx), stages)

    pipelines = before + stages + after

    deploys = example_deploys(ctx)
    if ctx.build.event != "cron":
        # run example deploys on cron even if some prior pipelines fail
        deploys = pipelinesDependsOn(deploys, pipelines)

    pipelines = pipelines + deploys + pipelinesDependsOn(
        [
            purgeBuildArtifactCache(ctx),
        ],
        pipelines,
    )

    pipelineSanityChecks(ctx, pipelines)
    return pipelines

def beforePipelines(ctx):
    return checkStarlark() + \
           licenseCheck(ctx) + \
           documentation(ctx) + \
           changelog(ctx) + \
           pnpmCache(ctx) + \
           cacheOcisPipeline(ctx) + \
           pipelinesDependsOn(buildCacheWeb(ctx), pnpmCache(ctx)) + \
           pipelinesDependsOn(pnpmlint(ctx), pnpmCache(ctx))

def stagePipelines(ctx):
    unit_test_pipelines = unitTests(ctx)

    # run only unit tests when publishing a standalone package
    if (determineReleasePackage(ctx) != None):
        return unit_test_pipelines

    e2e_pipelines = e2eTests(ctx)
    keycloak_pipelines = e2eTestsOnKeycloak(ctx)
    return unit_test_pipelines + buildAndTestDesignSystem(ctx) + pipelinesDependsOn(e2e_pipelines + keycloak_pipelines, unit_test_pipelines)

def afterPipelines(ctx):
    return build(ctx) + pipelinesDependsOn(notify(), build(ctx))

def pnpmCache(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "cache-pnpm",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": skipIfUnchanged(ctx, "cache") +
                 installPnpm() +
                 installPlaywright() +
                 rebuildBuildArtifactCache(ctx, "pnpm", ".pnpm-store") +
                 rebuildBuildArtifactCache(ctx, "playwright", ".playwright"),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def pnpmlint(ctx):
    pipelines = []

    if "pnpmlint" not in config:
        return pipelines

    if type(config["pnpmlint"]) == "bool":
        if not config["pnpmlint"]:
            return pipelines

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "lint",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": skipIfUnchanged(ctx, "lint") +
                 restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") +
                 installPnpm() +
                 lint(),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }

    for branch in config["branches"]:
        result["trigger"]["ref"].append("refs/heads/%s" % branch)

    pipelines.append(result)

    return pipelines

def build(ctx):
    pipelines = []

    if "build" not in config:
        return pipelines

    if type(config["build"]) == "bool":
        if not config["build"]:
            return pipelines

    steps = restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") + installPnpm() + buildRelease(ctx)

    if determineReleasePackage(ctx) == None:
        steps += buildDockerImage()

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "build",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": steps,
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
            ],
        },
    }

    pipelines.append(result)

    return pipelines

def changelog(ctx):
    pipelines = []
    repo_slug = ctx.build.source_repo if ctx.build.source_repo else ctx.repo.slug

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "changelog",
        "clone": {
            "disable": True,
        },
        "steps": [
            {
                "name": "clone",
                "image": PLUGINS_GIT_ACTION,
                "settings": {
                    "actions": [
                        "clone",
                    ],
                    "remote": "https://github.com/%s" % (repo_slug),
                    "branch": ctx.build.source if ctx.build.event == "pull_request" else "master",
                    "path": "/drone/src",
                    "netrc_machine": "github.com",
                    "netrc_username": {
                        "from_secret": "github_username",
                    },
                    "netrc_password": {
                        "from_secret": "github_token",
                    },
                },
            },
            {
                "name": "generate",
                "image": TOOLHIPPIE_CALENS,
                "commands": [
                    "calens >| CHANGELOG.md",
                ],
            },
            {
                "name": "diff",
                "image": OC_CI_ALPINE,
                "commands": [
                    "git diff",
                ],
            },
            {
                "name": "output",
                "image": TOOLHIPPIE_CALENS,
                "commands": [
                    "cat CHANGELOG.md",
                ],
            },
            {
                "name": "publish",
                "image": PLUGINS_GIT_ACTION,
                "settings": {
                    "actions": [
                        "commit",
                        "push",
                    ],
                    "message": "Automated changelog update [skip ci]",
                    "branch": "master",
                    "author_email": "devops@owncloud.com",
                    "author_name": "ownClouders",
                    "netrc_machine": "github.com",
                    "netrc_username": {
                        "from_secret": "github_username",
                    },
                    "netrc_password": {
                        "from_secret": "github_token",
                    },
                },
                "when": {
                    "ref": {
                        "exclude": [
                            "refs/pull/**",
                            "refs/tags/**",
                        ],
                    },
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/pull/**",
            ],
        },
    }

    pipelines.append(result)

    return pipelines

def buildCacheWeb(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "cache-web",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": skipIfUnchanged(ctx, "cache") +
                 restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") +
                 installPnpm() +
                 [{
                     "name": "build-web",
                     "image": OC_CI_NODEJS,
                     "environment": {
                         "NO_INSTALL": "true",
                     },
                     "commands": [
                         "make dist",
                     ],
                 }] +
                 rebuildBuildArtifactCache(ctx, "web-dist", "dist"),
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def unitTests(ctx):
    sonar_env = {
        "SONAR_TOKEN": {
            "from_secret": "sonar_token",
        },
    }
    if ctx.build.event == "pull_request":
        sonar_env.update({
            "SONAR_PULL_REQUEST_BASE": "%s" % (ctx.build.target),
            "SONAR_PULL_REQUEST_BRANCH": "%s" % (ctx.build.source),
            "SONAR_PULL_REQUEST_KEY": "%s" % (ctx.build.ref.replace("refs/pull/", "").split("/")[0]),
        })

    repo_slug = ctx.build.source_repo if ctx.build.source_repo else ctx.repo.slug

    fork_handling = []
    if ctx.build.source_repo != "" and ctx.build.source_repo != ctx.repo.slug:
        fork_handling = [
            "git remote add fork https://github.com/%s.git" % (ctx.build.source_repo),
            "git fetch fork",
        ]

    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "unit-tests",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "clone": {
            "disable": True,  # Sonarcloud does not apply issues on already merged branch
        },
        "steps": [
                     {
                         "name": "clone",
                         "image": ALPINE_GIT,
                         "commands": [
                                         # Always use the owncloud/web repository as base to have an up to date default branch.
                                         # This is needed for the skipIfUnchanged step, since it references a commit on master (which could be absent on a fork)
                                         "git clone https://github.com/%s.git ." % (ctx.repo.slug),
                                     ] + fork_handling +
                                     [
                                         "git checkout $DRONE_COMMIT",
                                     ],
                     },
                 ] +
                 skipIfUnchanged(ctx, "unit-tests") +
                 restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") +
                 installPnpm() +
                 [
                     {
                         "name": "unit-tests",
                         "image": OC_CI_NODEJS,
                         "commands": [
                             "pnpm build:tokens",
                             "pnpm test:unit --coverage",
                         ],
                     },
                     {
                         "name": "sonarcloud",
                         "image": SONARSOURCE_SONAR_SCANNER_CLI,
                         "environment": sonar_env,
                     },
                 ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def e2eTests(ctx):
    e2e_workspace = {
        "base": dir["base"],
        "path": config["app"],
    }

    e2e_volumes = [{
        "name": "uploads",
        "temp": {},
    }, {
        "name": "configs",
        "temp": {},
    }, {
        "name": "gopath",
        "temp": {},
    }, {
        "name": "ocis-config",
        "temp": {},
    }]

    default = {
        "skip": False,
        "logLevel": "2",
        "reportTracing": "false",
        "db": "mysql:5.5",
        "suites": [],
        "features": [],
        "tikaNeeded": False,
        "federationServer": False,
        "failOnUncaughtConsoleError": "false",
        "extraServerEnvironment": {},
    }

    e2e_trigger = {
        "ref": [
            "refs/heads/master",
            "refs/heads/stable-*",
            "refs/tags/**",
            "refs/pull/**",
        ],
    }

    pipelines = []
    params = {}
    matrices = config["e2e"]

    for suite, matrix in matrices.items():
        for item in default:
            params[item] = matrix[item] if item in matrix else default[item]

        if "app-provider" in suite and not "full-ci" in ctx.build.title.lower() and ctx.build.event != "cron":
            continue

        if "ocm" in suite and not "full-ci" in ctx.build.title.lower() and ctx.build.event != "cron":
            continue

        if params["skip"]:
            continue

        if ("with-tracing" in ctx.build.title.lower()):
            params["reportTracing"] = "true"

        environment = {
            "HEADLESS": "true",
            "RETRY": "1",
            "REPORT_TRACING": params["reportTracing"],
            "BASE_URL_OCIS": "ocis:9200",
            "FAIL_ON_UNCAUGHT_CONSOLE_ERR": "true",
        }

        steps = skipIfUnchanged(ctx, "e2e-tests") + \
                restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") + \
                installPnpm() + \
                restoreBuildArtifactCache(ctx, "web-dist", "dist")

        if ctx.build.event == "cron":
            steps += restoreBuildArtifactCache(ctx, "ocis", "ocis")
        else:
            steps += restoreOcisCache()

        if "app-provider" in suite:
            environment["FAIL_ON_UNCAUGHT_CONSOLE_ERR"] = False

            # app-provider specific steps
            steps += collaboraService() + \
                     onlyofficeService() + \
                     waitForServices("online-offices", ["collabora:9980", "onlyoffice:443"]) + \
                     ocisService(params["extraServerEnvironment"]) + \
                     wopiCollaborationService("collabora") + \
                     wopiCollaborationService("onlyoffice") + \
                     waitForServices("wopi", ["wopi-collabora:9300", "wopi-onlyoffice:9300"])
        elif "ocm" in suite:
            steps += collaboraService() + \
                     waitForServices("online-offices", ["collabora:9980"]) + \
                     ocisService(params["extraServerEnvironment"]) + \
                     (ocisService(params["extraServerEnvironment"], "federation") if params["federationServer"] else []) + \
                     wopiCollaborationService("collabora") + \
                     wopiCollaborationService("collabora", "federation") + \
                     waitForServices("wopi", ["wopi-collabora:9300"])
        else:
            # oCIS specific steps
            steps += (tikaService() if params["tikaNeeded"] else []) + \
                     ocisService(params["extraServerEnvironment"])

        command = "bash run-e2e.sh "
        if "suites" in matrix:
            command += "--suites %s" % ",".join(params["suites"])
        elif "features" in matrix:
            command += "%s" % " ".join(params["features"])
        else:
            print("Error: No suites or features defined for e2e test suite '%s'" % suite)
            return []

        steps += [{
                     "name": "e2e-tests",
                     "image": OC_CI_NODEJS,
                     "environment": environment,
                     "commands": [
                         "cd tests/e2e",
                         command,
                     ],
                 }] + \
                 uploadTracingResult(ctx) + \
                 logTracingResult(ctx, "e2e-tests %s" % suite)

        pipelines.append({
            "kind": "pipeline",
            "type": "docker",
            "name": "e2e-tests-%s" % suite,
            "workspace": e2e_workspace,
            "steps": steps,
            "depends_on": ["cache-ocis"],
            "trigger": e2e_trigger,
            "volumes": e2e_volumes,
        })
    return pipelines

def notify():
    pipelines = []

    result = {
        "kind": "pipeline",
        "type": "docker",
        "name": "chat-notifications",
        "clone": {
            "disable": True,
        },
        "steps": [
            {
                "name": "notify-rocketchat",
                "image": PLUGINS_SLACK,
                "settings": {
                    "webhook": {
                        "from_secret": config["rocketchat"]["from_secret"],
                    },
                    "channel": config["rocketchat"]["channel"],
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/tags/**",
            ],
            "status": [
                "success",
                "failure",
            ],
        },
    }

    for branch in config["branches"]:
        result["trigger"]["ref"].append("refs/heads/%s" % branch)

    pipelines.append(result)

    return pipelines

def installPnpm():
    return [{
        "name": "pnpm-install",
        "image": OC_CI_NODEJS,
        "commands": [
            'npm install --silent --global --force "$(jq -r ".packageManager" < package.json)"',
            "pnpm config set store-dir ./.pnpm-store",
            "pnpm install",
        ],
    }]

def installPlaywright():
    return [{
        "name": "playwright-install",
        "image": OC_CI_NODEJS,
        "environment": {
            "PLAYWRIGHT_BROWSERS_PATH": ".playwright",
        },
        "commands": [
            "pnpm exec playwright install chromium --with-deps",
        ],
    }]

def lint():
    return [{
        "name": "lint",
        "image": OC_CI_NODEJS,
        "commands": [
            "pnpm lint",
        ],
    }]

def buildDockerImage():
    return [{
        "name": "docker",
        "image": PLUGINS_DOCKER,
        "settings": {
            "username": {
                "from_secret": "docker_username",
            },
            "password": {
                "from_secret": "docker_password",
            },
            "auto_tag": True,
            "dockerfile": "docker/Dockerfile",
            "repo": "owncloud/web",
        },
        "when": {
            "ref": {
                "exclude": [
                    "refs/pull/**",
                ],
            },
        },
    }]

def determineReleasePackage(ctx):
    if ctx.build.event != "tag":
        return None

    matches = [p for p in WEB_PUBLISH_NPM_PACKAGES if ctx.build.ref.startswith("refs/tags/%s-v" % p)]
    if len(matches) > 0:
        return matches[0]

    return None

def determineReleaseVersion(ctx):
    package = determineReleasePackage(ctx)
    if package == None:
        return ctx.build.ref.replace("refs/tags/v", "")

    return ctx.build.ref.replace("refs/tags/" + package + "-v", "")

def buildRelease(ctx):
    steps = []
    package = determineReleasePackage(ctx)
    version = determineReleaseVersion(ctx)

    if package == None:
        steps += [
            {
                "name": "make",
                "image": OC_CI_NODEJS,
                "environment": {
                    "NO_INSTALL": "true",
                },
                "commands": [
                    "cd %s" % dir["web"],
                    "make -f Makefile.release",
                ],
            },
            {
                "name": "changelog",
                "image": TOOLHIPPIE_CALENS,
                "commands": [
                    "calens --version %s -o dist/CHANGELOG.md -t changelog/CHANGELOG-Release.tmpl" % version.split("-")[0],
                ],
                "when": {
                    "ref": [
                        "refs/tags/**",
                    ],
                },
            },
            {
                "name": "publish",
                "image": PLUGINS_GITHUB_RELEASE,
                "settings": {
                    "api_key": {
                        "from_secret": "github_token",
                    },
                    "files": [
                        "release/*",
                    ],
                    "checksum": [
                        "md5",
                        "sha256",
                    ],
                    "title": ctx.build.ref.replace("refs/tags/v", ""),
                    "note": "dist/CHANGELOG.md",
                    "overwrite": True,
                },
                "when": {
                    "ref": [
                        "refs/tags/**",
                    ],
                },
            },
        ]
    else:
        full_package_name = "%s/%s" % (WEB_PUBLISH_NPM_ORGANIZATION, package)
        steps.append(
            {
                "name": "publish",
                "image": OC_CI_NODEJS,
                "environment": {
                    "NPM_TOKEN": {
                        "from_secret": "npm_token",
                    },
                },
                "commands": [
                    "echo Build " + package + " " + version + " package.json: $(jq -r '.version' < packages/%s/package.json)" % package,
                    "[ \"$(jq -r '.version'  < packages/%s/package.json)\" = \"%s\" ] || (echo \"git tag does not match version in packages/%s/package.json\"; exit 1)" % (package, version, package),
                    "git checkout .",
                    "git clean -fd",
                    "git diff",
                    "git status",
                    "pnpm build:tokens",
                    "bash -c '[ \"%s\" == \"design-system\" ] && pnpm --filter \"%s\" vite build || true'" % (package, full_package_name),
                    "bash -c '[ \"%s\" == \"web-client\" ] && pnpm --filter \"%s\" vite build || true'" % (package, full_package_name),
                    "bash -c '[ \"%s\" == \"web-pkg\" ] && pnpm --filter \"%s\" vite build || true'" % (package, full_package_name),
                    "bash -c '[ \"%s\" == \"web-test-helpers\" ] && pnpm --filter \"%s\" vite build || true'" % (package, full_package_name),
                    # until https://github.com/pnpm/pnpm/issues/5775 is resolved, we print pnpm whoami because that fails when the npm_token is invalid
                    "env \"npm_config_//registry.npmjs.org/:_authToken=$${NPM_TOKEN}\" pnpm whoami",
                    "env \"npm_config_//registry.npmjs.org/:_authToken=$${NPM_TOKEN}\" pnpm publish --no-git-checks --filter %s --access public --tag latest" % full_package_name,
                ],
                "when": {
                    "ref": [
                        "refs/tags/**",
                    ],
                },
            },
        )

    return steps

def documentation(ctx):
    return [
        {
            "kind": "pipeline",
            "type": "docker",
            "name": "documentation",
            "platform": {
                "os": "linux",
                "arch": "amd64",
            },
            "steps": [
                {
                    "name": "prepare",
                    "image": OC_CI_ALPINE,
                    "commands": [
                        "make docs-copy",
                    ],
                },
                {
                    "name": "test",
                    "image": OC_CI_HUGO,
                    "commands": [
                        "cd hugo",
                        "hugo",
                    ],
                },
                {
                    "name": "list",
                    "image": OC_CI_ALPINE,
                    "commands": [
                        "tree hugo/public",
                    ],
                },
                {
                    "name": "publish",
                    "image": PLUGINS_GH_PAGES,
                    "settings": {
                        "username": {
                            "from_secret": "github_username",
                        },
                        "password": {
                            "from_secret": "github_token",
                        },
                        "pages_directory": "docs/",
                        "copy_contents": "true",
                        "target_branch": "docs",
                        "delete": "true",
                    },
                    "when": {
                        "ref": {
                            "exclude": [
                                "refs/pull/**",
                            ],
                        },
                    },
                },
            ],
            "trigger": {
                "ref": [
                    "refs/heads/master",
                    "refs/pull/**",
                ],
            },
        },
    ]

def ocisService(extra_env_config = {}, deploy_type = "ocis"):
    environment = {
        "IDM_ADMIN_PASSWORD": "admin",  # override the random admin password from `ocis init`
        "OCIS_INSECURE": "true",
        "OCIS_LOG_LEVEL": "error",
        "OCIS_JWT_SECRET": "some-ocis-jwt-secret",
        "LDAP_GROUP_SUBSTRING_FILTER_TYPE": "any",
        "LDAP_USER_SUBSTRING_FILTER_TYPE": "any",
        "PROXY_ENABLE_BASIC_AUTH": True,
        "WEB_ASSET_CORE_PATH": "%s/dist" % dir["web"],
        "FRONTEND_SEARCH_MIN_LENGTH": "2",
        "FRONTEND_OCS_ENABLE_DENIALS": True,
        "OCIS_PASSWORD_POLICY_BANNED_PASSWORDS_LIST": "%s/tests/drone/banned-passwords.txt" % dir["web"],
        "PROXY_CSP_CONFIG_FILE_LOCATION": "%s/tests/drone/csp.yaml" % dir["web"],
        # Needed for enabling all roles
        "GRAPH_AVAILABLE_ROLES": "b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5,a8d5fe5e-96e3-418d-825b-534dbdf22b99,fb6c3e19-e378-47e5-b277-9732f9de6e21,58c63c02-1d89-4572-916a-870abc5a1b7d,2d00ce52-1fc2-4dbc-8b95-a73b73395f5a,1c996275-f1c9-4e71-abdf-a42f6495e960,312c0871-5ef7-4b3a-85b6-0e4074c64049,aa97fe03-7980-45ac-9e50-b325749fd7e6",
    }

    if deploy_type == "federation":
        environment["OCIS_URL"] = "https://federation-ocis:10200"
        environment["PROXY_HTTP_ADDR"] = "federation-ocis:10200"
        environment["WEB_UI_CONFIG_FILE"] = dir["federatedOcisConfig"]
        container_name = "federation-ocis"
        ocis_domain = "federation-ocis:10200"
    else:
        container_name = "ocis"
        ocis_domain = "ocis:9200"
        environment["OCIS_URL"] = "https://ocis:9200"
        environment["WEB_UI_CONFIG_FILE"] = dir["ocisConfig"]

    for config in extra_env_config:
        environment[config] = extra_env_config[config]

    wait_for_service = waitForServices("ocis", ["ocis:9200"])
    if "OCIS_EXCLUDE_RUN_SERVICES" not in environment or "idp" not in environment["OCIS_EXCLUDE_RUN_SERVICES"]:
        wait_for_service = [
            {
                "name": "wait-for-%s" % container_name,
                "image": OC_CI_ALPINE,
                "commands": [
                    "timeout 300 bash -c 'while [ $(curl -sk -uadmin:admin " +
                    "%s/graph/v1.0/users/admin " % environment["OCIS_URL"] +
                    "-w %{http_code} -o /dev/null) != 200 ]; do sleep 1; done'",
                ],
            },
        ]

    return [
        {
            "name": container_name,
            "image": OC_CI_GOLANG,
            "detach": True,
            "environment": environment,
            "commands": [
                "mkdir -p %s" % dir["ocisRevaDataRoot"],
                "mkdir -p /srv/app/tmp/ocis/storage/users/",
                "./ocis init",
                "cp %s/tests/drone/app-registry.yaml /root/.ocis/config/app-registry.yaml" % dir["web"],
                "./ocis server",
            ],
            "volumes": [{
                "name": "gopath",
                "path": dir["app"],
            }],
        },
    ] + wait_for_service

def checkForExistingOcisCache(ctx):
    web_repo_path = "https://raw.githubusercontent.com/owncloud/web/%s" % ctx.build.commit
    return [
        {
            "name": "check-for-existing-cache",
            "image": MINIO_MC,
            "environment": minio_mc_environment,
            "commands": [
                "curl -o .drone.env %s/.drone.env" % web_repo_path,
                "curl -o check-oCIS-cache.sh %s/tests/drone/check-oCIS-cache.sh" % web_repo_path,
                ". ./.drone.env",
                "mc alias set s3 $MC_HOST $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY",
                "mc ls --recursive s3/$CACHE_BUCKET/ocis-build",
                "bash check-oCIS-cache.sh",
            ],
        },
    ]

def cacheOcisPipeline(ctx):
    steps = []

    if ctx.build.event == "cron":
        steps = getOcislatestCommitId(ctx) + \
                buildOcis() + \
                rebuildBuildArtifactCache(ctx, "ocis", "ocis")
    else:
        steps = checkForExistingOcisCache(ctx) + \
                buildOcis() + \
                cacheOcis()
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "cache-ocis",
        "workspace": web_workspace,
        "clone": {
            "disable": True,
        },
        "steps": steps,
        "volumes": [{
            "name": "gopath",
            "temp": {},
        }],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def restoreOcisCache():
    return [{
        "name": "restore-ocis-cache",
        "image": MINIO_MC,
        "environment": minio_mc_environment,
        "commands": [
            ". ./.drone.env",
            "mc alias set s3 $MC_HOST $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY",
            "mc cp -r -a s3/$CACHE_BUCKET/ocis-build/$OCIS_COMMITID/ocis %s" % dir["web"],
        ],
    }]

def buildOcis():
    ocis_repo_url = "https://github.com/owncloud/ocis.git"
    return [
        {
            "name": "clone-ocis",
            "image": OC_CI_GOLANG,
            "commands": [
                "source .drone.env",
                # NOTE: it is important to not start repo name with ocis*
                # because we copy ocis binary to root workspace
                # and upload binary <workspace>/ocis to cache bucket.
                # This prevents accidental upload of ocis repo to the cache
                "git clone -b $OCIS_BRANCH --single-branch %s repo_ocis" % ocis_repo_url,
                "cd repo_ocis",
                "git checkout $OCIS_COMMITID",
            ],
            "volumes": go_step_volumes,
        },
        {
            "name": "generate-ocis",
            "image": OC_CI_NODEJS,
            "commands": [
                "cd repo_ocis",
                "retry -t 3 'make ci-node-generate'",
            ],
            "volumes": go_step_volumes,
        },
        {
            "name": "build-ocis",
            "image": OC_CI_GOLANG,
            "commands": [
                "source .drone.env",
                "cd repo_ocis/ocis",
                "retry -t 3 'make build'",
                "cp bin/ocis %s" % dir["web"],
            ],
            "volumes": go_step_volumes,
        },
    ]

def cacheOcis():
    return [{
        "name": "upload-ocis-cache",
        "image": MINIO_MC,
        "environment": minio_mc_environment,
        "commands": [
            ". ./.drone.env",
            "mc alias set s3 $MC_HOST $AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY",
            "mc cp -a %s/ocis s3/$CACHE_BUCKET/ocis-build/$OCIS_COMMITID/" % dir["web"],
            "mc ls --recursive s3/$CACHE_BUCKET/ocis-build",
        ],
    }]

def example_deploys(ctx):
    on_merge_deploy = [
        "ocis_web/master.yml",
    ]
    nightly_deploy = []

    # if on master branch:
    configs = on_merge_deploy
    rebuild = "false"

    if ctx.build.event == "tag":
        configs = nightly_deploy
        rebuild = "false"

    if ctx.build.event == "cron":
        configs = on_merge_deploy + nightly_deploy
        rebuild = "true"

    deploys = []
    for config in configs:
        deploys.append(deploy(ctx, config, rebuild))

    return deploys

def deploy(ctx, config, rebuild):
    return {
        "kind": "pipeline",
        "type": "docker",
        "name": "deploy_%s" % (config),
        "platform": {
            "os": "linux",
            "arch": "amd64",
        },
        "steps": [
            {
                "name": "clone continuous deployment playbook",
                "image": ALPINE_GIT,
                "commands": [
                    "cd deployments/continuous-deployment-config",
                    "git clone https://github.com/owncloud-devops/continuous-deployment.git",
                ],
            },
            {
                "name": "deploy",
                "image": OC_CI_DRONE_ANSIBLE,
                "failure": "ignore",
                "environment": {
                    "CONTINUOUS_DEPLOY_SERVERS_CONFIG": "../%s" % (config),
                    "REBUILD": "%s" % (rebuild),
                    "HCLOUD_API_TOKEN": {
                        "from_secret": "hcloud_api_token",
                    },
                    "CLOUDFLARE_API_TOKEN": {
                        "from_secret": "cloudflare_api_token",
                    },
                },
                "settings": {
                    "playbook": "deployments/continuous-deployment-config/continuous-deployment/playbook-all.yml",
                    "galaxy": "deployments/continuous-deployment-config/continuous-deployment/requirements.yml",
                    "requirements": "deployments/continuous-deployment-config/continuous-deployment/py-requirements.txt",
                    "inventory": "localhost",
                    "private_key": {
                        "from_secret": "ssh_private_key",
                    },
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
            ],
        },
    }

def checkStarlark():
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "check-starlark",
        "steps": [
            {
                "name": "format-check-starlark",
                "image": OC_CI_BAZEL_BUILDIFIER,
                "commands": [
                    "buildifier --mode=check .drone.star",
                ],
            },
            {
                "name": "show-diff",
                "image": OC_CI_BAZEL_BUILDIFIER,
                "commands": [
                    "buildifier --mode=fix .drone.star",
                    "git diff",
                ],
                "when": {
                    "status": [
                        "failure",
                    ],
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/pull/**",
            ],
        },
    }]

def licenseCheck(ctx):
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "license-check",
        "platform": {
            "os": "linux",
            "arch": "amd64",
        },
        "steps": installPnpm() + [
            {
                "name": "node-check-licenses",
                "image": OC_CI_NODEJS,
                "commands": [
                    "pnpm licenses:check",
                ],
            },
            {
                "name": "node-save-licenses",
                "image": OC_CI_NODEJS,
                "commands": [
                    "pnpm licenses:csv",
                    "pnpm licenses:save",
                ],
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def pipelineDependsOn(pipeline, dependant_pipelines):
    if "depends_on" in pipeline.keys():
        pipeline["depends_on"] = pipeline["depends_on"] + getPipelineNames(dependant_pipelines)
    else:
        pipeline["depends_on"] = getPipelineNames(dependant_pipelines)
    return pipeline

def pipelinesDependsOn(pipelines, dependant_pipelines):
    pipes = []
    for pipeline in pipelines:
        pipes.append(pipelineDependsOn(pipeline, dependant_pipelines))

    return pipes

def getPipelineNames(pipelines = []):
    """getPipelineNames returns names of pipelines as a string array

    Args:
      pipelines: array of drone pipelines

    Returns:
      names of the given pipelines as string array
    """
    names = []
    for pipeline in pipelines:
        names.append(pipeline["name"])
    return names

def skipIfUnchanged(ctx, type):
    if ("full-ci" in ctx.build.title.lower()):
        return []

    skip_step = {
        "name": "skip-if-unchanged",
        "image": OC_CI_DRONE_SKIP_PIPELINE,
        "when": {
            "event": [
                "pull_request",
            ],
        },
    }

    base_skip_steps = [
        "^.github/.*",
        "^changelog/.*",
        "^config/.*",
        "^deployments/.*",
        "^dev/.*",
        "^docs/.*",
        "^packages/web-app-skeleton/.*",
        "README.md",
    ]

    if type == "cache" or type == "lint":
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps,
        }
        return [skip_step]

    if type == "e2e-tests":
        e2e_skip_steps = [
            "^__fixtures__/.*",
            "^__mocks__/.*",
            "^packages/.*/tests/.*",
            "^tests/unit/.*",
        ]
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps + e2e_skip_steps,
        }
        return [skip_step]

    if type == "unit-tests":
        unit_skip_steps = [
            "^tests/e2e/.*",
        ]
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps + unit_skip_steps,
        }
        return [skip_step]

    if type == "e2e-tests":
        e2e_skip_steps = [
            "^__fixtures__/.*",
            "^__mocks__/.*",
            "^packages/.*/tests/.*",
            "^tests/unit/.*",
        ]
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps + e2e_skip_steps,
        }
        return [skip_step]

    if type == "unit-tests":
        unit_skip_steps = [
            "^tests/e2e/.*",
        ]
        skip_step["settings"] = {
            "ALLOW_SKIP_CHANGED": base_skip_steps + unit_skip_steps,
        }
        return [skip_step]

    return []

def genericCache(name, action, mounts, cache_path):
    rebuild = "false"
    restore = "false"
    if action == "rebuild":
        rebuild = "true"
        action = "rebuild"
    else:
        restore = "true"
        action = "restore"

    step = {
        "name": "%s_%s" % (action, name),
        "image": PLUGINS_S3_CACHE,
        "settings": {
            "endpoint": {
                "from_secret": "cache_s3_server",
            },
            "rebuild": rebuild,
            "restore": restore,
            "mount": mounts,
            "access_key": {
                "from_secret": "cache_s3_access_key",
            },
            "secret_key": {
                "from_secret": "cache_s3_secret_key",
            },
            "filename": "%s.tar" % (name),
            "path": cache_path,
            "fallback_path": cache_path,
        },
    }
    return step

def genericCachePurge(flush_path):
    return {
        "kind": "pipeline",
        "type": "docker",
        "name": "purge_build_artifact_cache",
        "clone": {
            "disable": True,
        },
        "platform": {
            "os": "linux",
            "arch": "amd64",
        },
        "steps": [
            {
                "name": "purge-cache",
                "image": PLUGINS_S3_CACHE,
                "settings": {
                    "access_key": {
                        "from_secret": "cache_s3_access_key",
                    },
                    "endpoint": {
                        "from_secret": "cache_s3_server",
                    },
                    "secret_key": {
                        "from_secret": "cache_s3_secret_key",
                    },
                    "flush": True,
                    "flush_age": 1,
                    "flush_path": flush_path,
                },
            },
        ],
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
            "status": [
                "success",
                "failure",
            ],
        },
    }

def genericBuildArtifactCache(ctx, name, action, path):
    if action == "rebuild" or action == "restore":
        cache_path = "%s/%s/%s" % ("cache", ctx.repo.slug, ctx.build.commit + "-${DRONE_BUILD_NUMBER}")
        name = "%s_build_artifact_cache" % (name)
        return genericCache(name, action, [path], cache_path)

    if action == "purge":
        flush_path = "%s/%s" % ("cache", ctx.repo.slug)
        return genericCachePurge(flush_path)
    return []

def restoreBuildArtifactCache(ctx, name, path):
    return [genericBuildArtifactCache(ctx, name, "restore", path)]

def rebuildBuildArtifactCache(ctx, name, path):
    return [genericBuildArtifactCache(ctx, name, "rebuild", path)]

def purgeBuildArtifactCache(ctx):
    return genericBuildArtifactCache(ctx, "", "purge", [])

def pipelineSanityChecks(ctx, pipelines):
    """pipelineSanityChecks helps the CI developers to find errors before running it

    These sanity checks are only executed on when converting starlark to yaml.
    Error outputs are only visible when the conversion is done with the drone cli.

    Args:
      ctx: drone passes a context with information which the pipeline can be adapted to
      pipelines: pipelines to be checked, normally you should run this on the return value of main()

    Returns:
      none
    """

    # check if name length of pipeline and steps are exceeded.
    max_name_length = 50
    for pipeline in pipelines:
        pipeline_name = pipeline["name"]
        if len(pipeline_name) > max_name_length:
            print("Error: pipeline name %s is longer than 50 characters" % (pipeline_name))

        for step in pipeline["steps"]:
            step_name = step["name"]
            if len(step_name) > max_name_length:
                print("Error: step name %s in pipeline %s is longer than 50 characters" % (step_name, pipeline_name))

    # check for non existing depends_on
    possible_depends = []
    for pipeline in pipelines:
        possible_depends.append(pipeline["name"])

    for pipeline in pipelines:
        if "depends_on" in pipeline.keys():
            for depends in pipeline["depends_on"]:
                if not depends in possible_depends:
                    print("Error: depends_on %s for pipeline %s is not defined" % (depends, pipeline["name"]))

    # check for non declared volumes
    for pipeline in pipelines:
        pipeline_volumes = []
        if "volumes" in pipeline.keys():
            for volume in pipeline["volumes"]:
                pipeline_volumes.append(volume["name"])

        for step in pipeline["steps"]:
            if "volumes" in step.keys():
                for volume in step["volumes"]:
                    if not volume["name"] in pipeline_volumes:
                        print("Warning: volume %s for step %s is not defined in pipeline %s" % (volume["name"], step["name"], pipeline["name"]))

    # list used docker images
    print("")
    print("List of used docker images:")

    images = {}

    for pipeline in pipelines:
        for step in pipeline["steps"]:
            image = step["image"]
            if image in images.keys():
                images[image] = images[image] + 1
            else:
                images[image] = 1

    for image in images.keys():
        print(" %sx\t%s" % (images[image], image))

def uploadTracingResult(ctx):
    status = ["failure"]
    if ("with-tracing" in ctx.build.title.lower()):
        status = ["failure", "success"]

    return [{
        "name": "upload-tracing-result",
        "image": PLUGINS_S3,
        "pull": "if-not-exists",
        "settings": {
            "bucket": {
                "from_secret": "cache_public_s3_bucket",
            },
            "endpoint": {
                "from_secret": "cache_public_s3_server",
            },
            "path_style": True,
            "source": "%s/reports/e2e/playwright/tracing/**/*" % dir["web"],
            "strip_prefix": "%s/reports/e2e/playwright/tracing" % dir["web"],
            "target": "/${DRONE_REPO}/${DRONE_BUILD_NUMBER}/tracing",
        },
        "environment": {
            "AWS_ACCESS_KEY_ID": {
                "from_secret": "cache_public_s3_access_key",
            },
            "AWS_SECRET_ACCESS_KEY": {
                "from_secret": "cache_public_s3_secret_key",
            },
        },
        "when": {
            "status": status,
        },
    }]

def logTracingResult(ctx, suite):
    status = ["failure"]

    if ("with-tracing" in ctx.build.title.lower()):
        status = ["failure", "success"]

    return [{
        "name": "log-tracing-result",
        "image": OC_UBUNTU,
        "commands": [
            "cd %s/reports/e2e/playwright/tracing/" % dir["web"],
            'echo "To see the trace, please open the following link in the console"',
            'for f in *.zip; do echo "npx playwright show-trace https://cache.owncloud.com/public/${DRONE_REPO}/${DRONE_BUILD_NUMBER}/tracing/$f \n"; done',
        ],
        "when": {
            "status": status,
        },
    }]

def waitForServices(name, services = []):
    services = ",".join(services)
    return [{
        "name": "wait-for-%s" % name,
        "image": OC_CI_WAIT_FOR,
        "commands": [
            "wait-for -it %s -t 300" % services,
        ],
    }]

def tikaService():
    return [{
        "name": "tika",
        "type": "docker",
        "image": APACHE_TIKA,
        "detach": True,
    }] + waitForServices("tika", ["tika:9998"])

def collaboraService():
    return [
        {
            "name": "collabora",
            "type": "docker",
            "image": COLLABORA_CODE,
            "detach": True,
            "environment": {
                "DONT_GEN_SSL_CERT": "set",
                "extra_params": "--o:ssl.enable=true --o:ssl.termination=true --o:welcome.enable=false --o:net.frame_ancestors=https://ocis:9200",
            },
            "commands": [
                "coolconfig generate-proof-key",
                "bash /start-collabora-online.sh",
            ],
        },
    ]

def onlyofficeService():
    return [
        {
            "name": "onlyoffice",
            "type": "docker",
            "image": ONLYOFFICE_DOCUMENT_SERVER,
            "detach": True,
            "environment": {
                "WOPI_ENABLED": "true",
                "USE_UNAUTHORIZED_STORAGE": "true",  # self signed certificates
            },
            "commands": [
                "cp %s/tests/drone/onlyoffice/local.json /etc/onlyoffice/documentserver/local.json" % dir["web"],
                "openssl req -x509 -newkey rsa:4096 -keyout onlyoffice.key -out onlyoffice.crt -sha256 -days 365 -batch -nodes",
                "mkdir -p /var/www/onlyoffice/Data/certs",
                "cp onlyoffice.key /var/www/onlyoffice/Data/certs/",
                "cp onlyoffice.crt /var/www/onlyoffice/Data/certs/",
                "chmod 400 /var/www/onlyoffice/Data/certs/onlyoffice.key",
                "/app/ds/run-document-server.sh",
            ],
        },
    ]

def wopiCollaborationService(name, deploy_type = "ocis"):
    environment = {
        "MICRO_REGISTRY": "nats-js-kv",
        "MICRO_REGISTRY_ADDRESS": "ocis:9233",
        "COLLABORATION_GRPC_ADDR": "0.0.0.0:9301",
        "COLLABORATION_HTTP_ADDR": "0.0.0.0:9300",
        "COLLABORATION_APP_INSECURE": True,
        "COLLABORATION_CS3API_DATAGATEWAY_INSECURE": True,
        "OCIS_JWT_SECRET": "some-ocis-jwt-secret",
        "COLLABORATION_WOPI_SECRET": "some-wopi-secret",
    }

    if deploy_type == "federation":
        environment["OCIS_URL"] = "https://federation-ocis:10200"
        container_name = "federation-%s" % name
    else:
        container_name = name
        environment["OCIS_URL"] = "https://ocis:9200"

    service_name = "wopi-%s" % container_name

    if name == "collabora":
        environment["COLLABORATION_APP_NAME"] = "Collabora"
        environment["COLLABORATION_APP_ADDR"] = "https://collabora:9980"
        environment["COLLABORATION_APP_ICON"] = "https://collabora:9980/favicon.ico"
    elif name == "onlyoffice":
        environment["COLLABORATION_APP_NAME"] = "OnlyOffice"
        environment["COLLABORATION_APP_ADDR"] = "https://onlyoffice"
        environment["COLLABORATION_APP_ICON"] = "https://onlyoffice/web-apps/apps/documenteditor/main/resources/img/favicon.ico"

    environment["COLLABORATION_WOPI_SRC"] = "http://%s:9300" % service_name

    return [
        {
            "name": service_name,
            "image": OC_CI_GOLANG,
            "detach": True,
            "environment": environment,
            "commands": [
                "./ocis collaboration server",
            ],
        },
    ]

def buildDesignSystemDocs():
    return [{
        "name": "build-design-system-docs",
        "image": OC_CI_NODEJS,
        "commands": [
            "pnpm --filter @ownclouders/design-system build:docs",
        ],
    }]

def runDesignSystemDocsE2eTests():
    return [{
        "name": "run-design-system-docs-e2e-tests",
        "image": OC_CI_NODEJS,
        "environment": {
            "PLAYWRIGHT_BROWSERS_PATH": ".playwright",
        },
        "commands": [
            "pnpm --filter @ownclouders/design-system test:e2e",
        ],
    }]

def buildAndTestDesignSystem(ctx):
    design_system_trigger = {
        "ref": [
            "refs/heads/master",
            "refs/heads/stable-*",
            "refs/tags/**",
            "refs/pull/**",
        ],
    }

    steps = restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") + \
            restoreBuildArtifactCache(ctx, "playwright", ".playwright") + \
            installPnpm() + \
            buildDesignSystemDocs() + \
            runDesignSystemDocsE2eTests()

    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "design-system-build-and-test",
        "workspace": {
            "base": dir["base"],
            "path": config["app"],
        },
        "steps": steps,
        "trigger": design_system_trigger,
    }]

def postgresService():
    return [
        {
            "name": "postgres",
            "image": POSTGRES_ALPINE,
            "environment": {
                "POSTGRES_DB": "keycloak",
                "POSTGRES_USER": "keycloak",
                "POSTGRES_PASSWORD": "keycloak",
            },
        },
    ]

def keycloakService():
    return [{
               "name": "generate-keycloak-certs",
               "image": OC_CI_NODEJS,
               "commands": [
                   "mkdir -p keycloak-certs",
                   "openssl req -x509 -newkey rsa:2048 -keyout keycloak-certs/keycloakkey.pem -out keycloak-certs/keycloakcrt.pem -nodes -days 365 -subj '/CN=keycloak'",
                   "chmod -R 777 keycloak-certs",
               ],
               "volumes": [
                   {
                       "name": "certs",
                       "path": "/keycloak-certs",
                   },
               ],
           }] + waitForServices("postgres", ["postgres:5432"]) + \
           [{
               "name": "keycloak",
               "image": KEYCLOAK,
               "detach": True,
               "environment": {
                   "OCIS_DOMAIN": "ocis:9200",
                   "KC_HOSTNAME": "keycloak:8443",
                   "KC_DB": "postgres",
                   "KC_DB_URL": "jdbc:postgresql://postgres:5432/keycloak",
                   "KC_DB_USERNAME": "keycloak",
                   "KC_DB_PASSWORD": "keycloak",
                   "KC_FEATURES": "impersonation",
                   "KEYCLOAK_ADMIN": "admin",
                   "KEYCLOAK_ADMIN_PASSWORD": "admin",
                   "KC_HTTPS_CERTIFICATE_FILE": "./keycloak-certs/keycloakcrt.pem",
                   "KC_HTTPS_CERTIFICATE_KEY_FILE": "./keycloak-certs/keycloakkey.pem",
               },
               "commands": [
                   "mkdir -p /opt/keycloak/data/import",
                   "cp tests/drone/ocis_keycloak/ocis-ci-realm.dist.json /opt/keycloak/data/import/ocis-realm.json",
                   "/opt/keycloak/bin/kc.sh start-dev --proxy=edge --spi-connections-http-client-default-disable-trust-manager=true --import-realm --health-enabled=true",
               ],
               "volumes": [
                   {
                       "name": "certs",
                       "path": "/keycloak-certs",
                   },
               ],
           }] + waitForServices("keycloack", ["keycloak:8443"])

def e2eTestsOnKeycloak(ctx):
    e2e_Keycloak_tests = [
        "journeys",
        "admin-settings/users.feature:20",
        "admin-settings/users.feature:43",
        "admin-settings/users.feature:106",
        "admin-settings/users.feature:131",
        "admin-settings/users.feature:185",
        "admin-settings/spaces.feature",
        "admin-settings/groups.feature",
        "admin-settings/general.feature",
    ]

    e2e_volumes = [
        {
            "name": "uploads",
            "temp": {},
        },
        {
            "name": "configs",
            "temp": {},
        },
        {
            "name": "gopath",
            "temp": {},
        },
        {
            "name": "ocis-config",
            "temp": {},
        },
        {
            "name": "certs",
            "temp": {},
        },
    ]

    if not "full-ci" in ctx.build.title.lower() and ctx.build.event != "cron":
        return []

    steps = restoreBuildArtifactCache(ctx, "pnpm", ".pnpm-store") + \
            installPnpm() + \
            keycloakService() + \
            restoreBuildArtifactCache(ctx, "web-dist", "dist")
    if ctx.build.event == "cron":
        steps += restoreBuildArtifactCache(ctx, "ocis", "ocis")
    else:
        steps += restoreOcisCache()

    # configs to setup ocis with keycloak
    environment = {
        "PROXY_AUTOPROVISION_ACCOUNTS": "true",
        "PROXY_ROLE_ASSIGNMENT_DRIVER": "oidc",
        "OCIS_OIDC_ISSUER": "https://keycloak:8443/realms/oCIS",
        "PROXY_OIDC_REWRITE_WELLKNOWN": "true",
        "WEB_OIDC_CLIENT_ID": "web",
        "PROXY_USER_OIDC_CLAIM": "preferred_username",
        "PROXY_USER_CS3_CLAIM": "username",
        "OCIS_ADMIN_USER_ID": "",
        "OCIS_EXCLUDE_RUN_SERVICES": "idp",
        "GRAPH_ASSIGN_DEFAULT_USER_ROLE": "false",
        "GRAPH_USERNAME_MATCH": "none",
        "KEYCLOAK_DOMAIN": "keycloak:8443",
    }

    steps += ocisService(environment) + \
             [
                 {
                     "name": "e2e-tests",
                     "image": OC_CI_NODEJS,
                     "environment": {
                         "BASE_URL_OCIS": "ocis:9200",
                         "HEADLESS": "true",
                         "RETRY": "1",
                         "REPORT_TRACING": "with-tracing" in ctx.build.title.lower(),
                         "KEYCLOAK": "true",
                         "KEYCLOAK_HOST": "keycloak:8443",
                     },
                     "commands": [
                         "cd tests/e2e",
                         "bash run-e2e.sh %s" % " ".join(["cucumber/features/" + tests for tests in e2e_Keycloak_tests]),
                     ],
                 },
             ] + \
             uploadTracingResult(ctx) + \
             logTracingResult(ctx, "e2e-tests keycloack-journey-suite")

    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "e2e-test-on-keycloak",
        "workspace": web_workspace,
        "steps": steps,
        "services": postgresService(),
        "volumes": e2e_volumes,
        "trigger": {
            "ref": [
                "refs/heads/master",
                "refs/heads/stable-*",
                "refs/tags/**",
                "refs/pull/**",
            ],
        },
    }]

def getOcislatestCommitId(ctx):
    web_repo_path = "https://raw.githubusercontent.com/owncloud/web/%s" % ctx.build.commit
    return [
        {
            "name": "get-ocis-latest-commit-id",
            "image": OC_CI_ALPINE,
            "commands": [
                "curl -o .drone.env %s/.drone.env" % web_repo_path,
                "curl -o get-latest-ocis-commit-id.sh %s/tests/drone/get-latest-ocis-commit-id.sh" % web_repo_path,
                ". ./.drone.env",
                "bash get-latest-ocis-commit-id.sh",
            ],
        },
    ]
