##########################################################################
# Tiltfile: OpenCRVS Country config developer
# For more information about variables, please check:
# https://github.com/opencrvs/infrastructure/blob/develop/Tiltfile

core_images_tag = "develop"
# Build countryconfig image in local registry (use any name and tag you want)
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
countryconfig_image_tag="local"

load('ext://git_resource', 'git_checkout')
if not os.path.exists('../infrastructure'):
    # FIXME: Replace ocrvs-10672 to develop after testing
    git_checkout('git@github.com:opencrvs/infrastructure.git#ocrvs-10672', '../infrastructure')
if not os.path.exists('../infrastructure/tilt/opencrvs.tilt'):
  fail('Something went wrong while cloning infrastructure repository!')
load('../infrastructure/tilt/opencrvs.tilt', 'setup_opencrvs')

# Build countryconfig image
docker_build(countryconfig_image_name, ".",
              dockerfile="Dockerfile",
              network="host")

setup_opencrvs(
    infrastructure_path='../infrastructure',
    core_images_tag=core_images_tag,
    countryconfig_image_name=countryconfig_image_name,
    countryconfig_image_tag=countryconfig_image_tag,
)

print("✅ Tiltfile configuration loaded successfully.")
