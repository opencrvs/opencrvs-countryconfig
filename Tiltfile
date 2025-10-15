##########################################################################
# Tiltfile: OpenCRVS Country config developer
# For more information about variables, please check:
# https://github.com/opencrvs/infrastructure/blob/develop/Tiltfile

core_images_tag = "v1.9.0-beta-6"
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
countryconfig_image_tag="local"

if not os.path.exists('../infrastructure'):
    local("git clone git@github.com:opencrvs/infrastructure.git ../infrastructure")

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
