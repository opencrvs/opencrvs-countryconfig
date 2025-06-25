output "prod_public_ip" {
  value = hcloud_server.master.ipv4_address
}

output "staging_public_ip" {
  value = hcloud_server.staging.ipv4_address
}