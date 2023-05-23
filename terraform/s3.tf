locals {
  s3_origin_id = "portfolio-data-s3-origin-id"
}

resource "aws_s3_bucket" "instance" {
  bucket = "xsalazar-portfolio-data"
}

resource "aws_s3_bucket_acl" "instance" {
  bucket = aws_s3_bucket.instance.id
  acl    = "public-read"
}
