

module "opencrvs_template" {
  source             = "./node"
  name               = "${var.country_name}-${var.env_name}"
  private_network_id = hcloud_network.private_network.id
  location = "hel1"
  server_type = "cx22"
  user_data = templatefile("cloud-init.yaml", {
    ssh_key = trimspace(file(".ssh/id_rsa.pub"))
  })
}
