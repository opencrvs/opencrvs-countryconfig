############################################################
# Please check readme at: https://github.com/opencrvs/infrastructure/tree/develop
############################################################
# Variables declaration:
# Core images tag: usually "develop" or one of release name:
# - v1.7.0
# - v1.7.1
# NOTE: It could take any value from https://github.com/orgs/opencrvs/packages
# If you are under opencrvs-core repository, please use "local" tag
# Tilt will build new image every time when changes are made to repository
core_images_tag="develop"

# Countryconfig/Farajaland image repository and tag
# Usually image repository value is to your repository on DockerHub
# If for some reason you don't have DockerHub account yet, please create
# you local registry
# (see: https://medium.com/@ankitkumargupta/quick-start-local-docker-registry-35107038242e)
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
# If you are under opencrvs-countryconfig or your own repository, please use "local" tag,
# Tilt will build new image every time when changes are made to repository
countryconfig_image_tag="local"

# Namespaces:
opencrvs_namespace = 'opencrvs-dev'
dependencies_namespace = 'opencrvs-deps-dev'


# Checkout infrastructure directory if not exists
if not os.path.exists('../infrastructure'):
    local("git clone git@github.com:opencrvs/infrastructure.git ../infrastructure")

local_resource('README.md', cmd='awk "/For OpenCRVS Country Config Developers/{flag=1; next} /Seed data/{flag=0} flag" ../infrastructure/README.md', labels=['0.Readme'])


# Load extensions for namespace and helm operations
load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://namespace', 'namespace_create', 'namespace_inject')
load("../infrastructure/tilt/lib.tilt", "copy_secrets", "reset_environment", "seed_data")

include('../infrastructure/tilt/common.tilt')

# If your machine is powerful feel free to change parallel updates from default 3
# update_settings(max_parallel_updates=3)

# Build countryconfig image
docker_build(countryconfig_image_name, ".",
              dockerfile="Dockerfile",
              network="host")

# Create namespaces:
# - opencrvs-deps-dev, dependencies namespace
# - opencrvs-dev, main namespace
namespace_create(dependencies_namespace)
namespace_create(opencrvs_namespace)


# Install Traefik GW
# helm_repo('traefik-repo', 'https://traefik.github.io/charts', labels=['Dependencies'])
# helm_resource(
#   'traefik', 'traefik-repo/traefik', namespace='traefik', resource_deps=['traefik-repo'],
#   flags=['--values=../infrastructure/infrastructure/localhost/traefik/values.yaml'])

######################################################
# OpenCRVS Dependencies Deployment
# NOTE: This helm chart can be deployed as helm release
k8s_yaml(helm('../infrastructure/charts/dependencies',
  namespace=dependencies_namespace,
  values=['../infrastructure/infrastructure/localhost/dependencies/values-dev.yaml']))

######################################################
# OpenCRVS Deployment
k8s_yaml(
  helm('../infrastructure/charts/opencrvs-services',
       namespace=opencrvs_namespace,
       values=['../infrastructure/infrastructure/localhost/opencrvs-services/values-dev.yaml'],
       set=[
        "image.tag={}".format(core_images_tag),
        "countryconfig.image.name={}".format(countryconfig_image_name),
        "countryconfig.image.tag={}".format(countryconfig_image_tag)
        ]
      )
)

#######################################################
# Add Data Tasks to Tilt Dashboard
reset_environment(opencrvs_namespace, opencrvs_configuration_file)

seed_data(opencrvs_namespace, opencrvs_configuration_file)

if security_enabled:
    copy_secrets(dependencies_namespace, opencrvs_namespace)

print("✅ Tiltfile configuration loaded successfully.")
