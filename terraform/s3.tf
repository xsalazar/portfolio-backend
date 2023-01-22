resource "aws_s3_bucket" "instance" {
  bucket = "xsalazar-portfolio-data"
}


resource "aws_s3_bucket_policy" "s3_bucket_policy" {
  bucket = aws_s3_bucket.instance.id
  policy = data.aws_iam_policy_document.s3_policy_document.json
}

data "aws_iam_policy_document" "s3_policy_document" {
  statement {
    // Anyone...
    principals {
      type        = "*"
      identifiers = ["*"]
    }

    // ...can get objects...
    actions = ["s3:GetObject"]

    // ...in this bucket
    resources = ["${aws_s3_bucket.instance.arn}/*"]
  }
}
