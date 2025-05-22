resource "hcloud_server" "master" {
  name        = "${var.country_name}-${var.env_name}-master"
  image       = var.os_image
  server_type = var.server_type
  location    = var.location
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
  # TODO: Multinode setup will need this attribute to interact within the network
  # network {
  #   network_id = var.private_network_id
  #   # IP Used by the master node, needs to be static
  #   # Here the worker nodes will use 10.0.1.1 to communicate with the master node
  #   ip         = var.ip
  # }
  user_data = var.user_data
}

resource "hcloud_server" "worker" {
  name        = "${var.country_name}-${var.env_name}-worker"
  image       = var.os_image
  server_type = var.server_type
  location    = var.location
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
  # network {
  #   network_id = var.private_network_id
  #   # IP Used by the master node, needs to be static
  #   # Here the worker nodes will use 10.0.1.1 to communicate with the master node
  #   ip         = var.ip
  # }
  user_data = var.user_data
}

resource "hcloud_server" "staging" {
  name        = "${var.country_name}-${var.env_name}-staging"
  image       = var.os_image
  server_type = var.server_type
  location    = var.location
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
  # network {
  #   network_id = var.private_network_id
  #   # IP Used by the master node, needs to be static
  #   # Here the worker nodes will use 10.0.1.1 to communicate with the master node
  #   ip         = var.ip
  # }
  user_data = var.user_data
}

resource "hcloud_server" "node" {
  name        = "${var.country_name}-${var.env_name}-backup"
  image       = var.os_image
  server_type = var.server_type
  location    = var.location
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
  # network {
  #   network_id = var.private_network_id
  #   # IP Used by the master node, needs to be static
  #   # Here the worker nodes will use 10.0.1.1 to communicate with the master node
  #   ip         = var.ip
  # }
  user_data = var.user_data
}