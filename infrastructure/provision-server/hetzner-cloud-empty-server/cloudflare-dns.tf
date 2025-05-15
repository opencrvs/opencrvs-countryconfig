resource "cloudflare_dns_record" "a_record" {
  zone_id = var.cloudflare_zone_id
  name    = "${var.country_name}-${var.env_name}.opencrvs.dev"
  content   = module.opencrvs_template.public_ip
  proxied = false
  ttl = 3600
  type = "A"
}

resource "cloudflare_dns_record" "wildcard_record" {
  zone_id = var.cloudflare_zone_id
  name    = "*.${var.country_name}-${var.env_name}.opencrvs.dev"
  content   = module.opencrvs_template.public_ip
  proxied = false
  ttl = 3600
  type = "A"
}