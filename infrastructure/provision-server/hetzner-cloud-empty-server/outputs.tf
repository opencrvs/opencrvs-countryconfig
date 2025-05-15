
output "network_id" {
  value = hcloud_network.private_network.id
}


output "public_ip" {
  value = module.opencrvs_template.public_ip
}
