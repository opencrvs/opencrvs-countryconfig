##########################################################################
# Tiltfile: OpenCRVS Country config developer
# For more information about variables, please check:
# https://github.com/opencrvs/infrastructure/blob/develop/Tiltfile

# Helm charts branch or tag:
helm_chart_branch_or_tag = "develop"

# OpenCRVS core images tag:
# For releases it's ok to keeps same as branch_or_tag
core_images_tag = "develop"

# Build countryconfig image in local registry (use any name and tag you want)
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
countryconfig_image_tag="local"

load('ext://git_resource', 'git_checkout')

charts_repo_url = "git@github.com:opencrvs/opencrvs-helm-charts.git#{}".format(helm_chart_branch_or_tag)

if not os.path.exists('../opencrvs-helm-charts'):
  print("Cloning OpenCRVS Helm charts from {}...".format(charts_repo_url))
  git_checkout(charts_repo_url, '../opencrvs-helm-charts')
else:
  print("⚠️ Skipping clonning {}, folder {} already exists. Use `git` CLI to update repository".format(charts_repo_url, '../opencrvs-helm-charts'))
if not os.path.exists('../opencrvs-helm-charts/charts/dependencies') or not os.path.exists('../opencrvs-helm-charts/charts/opencrvs-services'):
  fail('Something went wrong while cloning infrastructure repository!')

load('../opencrvs-helm-charts/tilt/opencrvs.tilt', 'setup_opencrvs')

# Build countryconfig image
docker_build(
  "{0}:{1}".format(countryconfig_image_name, countryconfig_image_tag), 
  ".",
  dockerfile="Dockerfile",
  network="host",
  only=[
    './src',
    './package.json',
    './yarn.lock',
    './tsconfig.json',
    './start-prod.sh',
    './Dockerfile'
  ],
  live_update=[
    # Fallback to full rebuild if dependencies change
    fall_back_on(['package.json', 'yarn.lock', 'Dockerfile']),
    # Sync source code changes
    sync('./src', '/usr/src/app/src'),
    # Sync start script if it changes
    sync('./start-prod.sh', '/usr/src/app/start-prod.sh'),
  ]
)


# Build image with postgres and metabase assets
docker_build("{0}:{1}-assets".format(countryconfig_image_name, countryconfig_image_tag), ".",
              dockerfile="Dockerfile.assets",
              network="host",
              only=[
                'infrastructure/metabase',
                'infrastructure/postgres',
                './Dockerfile.assets'
              ]
)

setup_opencrvs(
    opencrvs_chart_repo='../opencrvs-helm-charts',
    core_images_tag=core_images_tag,
    countryconfig_image_name=countryconfig_image_name,
    countryconfig_image_tag=countryconfig_image_tag,
)

print("✅ Tiltfile configuration loaded successfully.")
