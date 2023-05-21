resource "aws_cloudfront_distribution" "instance" {
  enabled = true

  origin {
    domain_name = aws_s3_bucket.instance.bucket_regional_domain_name
    origin_id   = local.s3_origin_id
  }

  aliases = ["backend.xsalazar.com"]

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"] // lol
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "allow-all"
    cache_policy_id        = aws_cloudfront_cache_policy.instance.id
  }


  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.instance.arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_cache_policy" "instance" {
  name    = "portfolio-cloudfront-cache-policy"
  min_ttl = 60

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
