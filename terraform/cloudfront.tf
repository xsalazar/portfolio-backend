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
  }


  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.instance.arn
  }
}
