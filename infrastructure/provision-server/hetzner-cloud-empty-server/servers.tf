

module "opencrvs_single_node" {
  count       = (var.env_type == "single-node") ? 1 : 0
  source      = "./single-node"
  name        = "${var.country_name}-${var.env_name}"
  location    = "hel1"
  server_type = "cx43"
  user_data = templatefile("cloud-init.yaml", {
    ssh_key = trimspace(file(".ssh/id_rsa.pub"))
  })

}

module "opencrvs_multi_node" {
  count        = (var.env_type == "multi-node") ? 1 : 0
  source       = "./multi-node"
  country_name = var.country_name
  env_name     = var.env_name
  location     = "hel1"
  server_type  = "cx43"
  user_data = templatefile("cloud-init.yaml", {
    ssh_key = trimspace(file(".ssh/id_rsa.pub"))
  })
}
