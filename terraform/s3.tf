locals {
  s3_origin_id = "portfolio-data-s3-origin-id"
}

resource "aws_s3_bucket" "instance" {
  bucket = "xsalazar-portfolio-data"
}

resource "aws_s3_bucket_policy" "instance" {
  bucket = aws_s3_bucket.instance.id
  policy = data.aws_iam_policy_document.instance.json
}

data "aws_iam_policy_document" "instance" {
  statement {
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.instance.arn}/*",
    ]
  }
}
