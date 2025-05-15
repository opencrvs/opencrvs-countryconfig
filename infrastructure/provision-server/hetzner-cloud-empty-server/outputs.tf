
output "network_id" {
  value = hcloud_network.private_network.id
}


output "public_ip" {
  value = (
    var.env_type == "single-node" && length(module.opencrvs_single_node) > 0
    ? module.opencrvs_single_node[0].public_ip
    : null
  )
}


output "prod_public_ip" {
  value = (
    var.env_type != "single-node" && length(module.opencrvs_multi_node) > 0
    ? module.opencrvs_multi_node[0].prod_public_ip
    : null
  )
}


output "staging_public_ip" {
  value = (
    var.env_type != "single-node" && length(module.opencrvs_multi_node) > 0
    ? module.opencrvs_multi_node[0].staging_public_ip
    : null
  )
}
