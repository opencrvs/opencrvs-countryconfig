resource "cloudflare_dns_record" "a_record" {
  count = (var.env_type == "single-node") ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "${var.country_name}-${var.env_name}.opencrvs.dev"
  content   = module.opencrvs_single_node[0].public_ip
  proxied = false
  ttl = 3600
  type = "A"
}

resource "cloudflare_dns_record" "wildcard_record" {
  count = (var.env_type == "single-node") ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "*.${var.country_name}-${var.env_name}.opencrvs.dev"
  content   = module.opencrvs_single_node[0].public_ip
  proxied = false
  ttl = 3600
  type = "A"
}

resource "cloudflare_dns_record" "a_record_prod" {
  count = (var.env_type == "multi-node") ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "${var.country_name}-${var.env_name}-prod.opencrvs.dev"
  content   = module.opencrvs_multi_node[0].prod_public_ip
  proxied = false
  ttl = 3600
  type = "A"
}

resource "cloudflare_dns_record" "wildcard_record_prod" {
  count = (var.env_type == "multi-node") ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "*.${var.country_name}-${var.env_name}-prod.opencrvs.dev"
  content   = module.opencrvs_multi_node[0].prod_public_ip
  proxied = false
  ttl = 3600
  type = "A"
}

resource "cloudflare_dns_record" "a_record_staging" {
  count = (var.env_type == "multi-node") ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "${var.country_name}-${var.env_name}-staging.opencrvs.dev"
  content   = module.opencrvs_multi_node[0].staging_public_ip
  proxied = false
  ttl = 3600
  type = "A"
}

resource "cloudflare_dns_record" "wildcard_record_staging" {
  count = (var.env_type == "multi-node") ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "*.${var.country_name}-${var.env_name}-staging.opencrvs.dev"
  content   = module.opencrvs_multi_node[0].staging_public_ip
  proxied = false
  ttl = 3600
  type = "A"
}
