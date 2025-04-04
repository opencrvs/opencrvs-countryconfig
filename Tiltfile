############################################################
# Please check readme at: https://github.com/opencrvs/infrastructure/tree/develop
############################################################
# Variables declaration:
# Core images tag: usually "develop" or one of release name:
# - v1.7.0
# - v1.7.1
# NOTE: It could take any value from https://github.com/orgs/opencrvs/packages
core_images_tag="develop"

# Countryconfig/Farajaland image repository and tag
# Usually image repository value is to your repository on DockerHub
# If for some reason you don't have DockerHub account yet, please create
# you local registry
# (see: https://medium.com/@ankitkumargupta/quick-start-local-docker-registry-35107038242e)
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
# Usually image tag value is set to "local", Tilt will build new
# image every time when changes are made to repository
countryconfig_image_tag="local"

# Namespaces:
opencrvs_namespace = 'opencrvs-dev'
dependencies_namespace = 'opencrvs-deps-dev'

############################################################
# What common Tiltfile does?
# - Group resources by label on UI: http://localhost:10350/
include('../infrastructure/tilt/Tiltfile.common')

# Load extensions for configmap/secret/namespace operations
load('ext://configmap', 'configmap_create')
load('ext://secret', 'secret_create_generic', 'secret_from_dict', 'secret_create_tls')
load('ext://namespace', 'namespace_create', 'namespace_inject')
load('ext://helm_resource', 'helm_resource', 'helm_repo')

# If your machine is powerful feel free to change parallel updates from default 3
# update_settings(max_parallel_updates=3)

# Build countryconfig image
docker_build(countryconfig_image_name, ".",
              dockerfile="Dockerfile",
              network="host")

# Create namespaces:
# - traefik, ingress controller (https://opencrvs.localhost)
# - opencrvs-deps-dev, dependencies namespace
# - opencrvs-dev, main namespace
namespace_create('traefik')
namespace_create(dependencies_namespace)
namespace_create(opencrvs_namespace)

# Checkout infrastructure directory if not exists
if not os.path.exists('../infrastructure'):
    local("git clone git@github.com:opencrvs/infrastructure.git ../infrastructure")

# Install Traefik GW
helm_repo('traefik-repo', 'https://traefik.github.io/charts', labels=['Dependencies'])
helm_resource(
  'traefik', 'traefik-repo/traefik', namespace='traefik', resource_deps=['traefik-repo'],
  flags=['--values=../infrastructure/infrastructure/localhost/traefik/values.yaml'])

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

######################################################
# Data management tasks:
# - Reset database: This task is not part of helm deployment to avoid accidental data loss
# - Seed data: is part of helm install post-deploy hook, but it is a manual task as well
# - Run migration job, is part of helm install/upgrade post-deploy hook
cleanup_command = "../infrastructure/infrastructure/clear-all-data.k8s.sh --dependencies-namespace {1} -o {0}".format(
  opencrvs_namespace, dependencies_namespace
)
local_resource(
    'Reset database',
    labels=['2.Data-tasks'],
    auto_init=False,
    cmd=cleanup_command,
    trigger_mode=TRIGGER_MODE_MANUAL,
)
