# TODO: Multi-node setup will need this attribute to interact within the network
# Question is open since we don't plan to support docker swarm in a long term
# Create a private network for the cluster
# resource "hcloud_network" "private_network" {
#   name     = "${var.country_name}-${var.env_name}"
#   ip_range = "10.0.0.0/16"
# }

# resource "hcloud_network_subnet" "private_network_subnet" {
#   type         = "cloud"
#   network_id   = hcloud_network.private_network.id
#   network_zone = "eu-central"
#   ip_range     = "10.0.1.0/24"
# }
