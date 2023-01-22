resource "aws_s3_bucket" "instance" {
  bucket = "xsalazar-portfolio-data"
}

# resource "aws_s3_bucket_notification" "instance" {
#   bucket = aws_s3_bucket.instance.bucket

#   lambda_function {
#     events              = ["s3:ObjectCreated:*"]
#     lambda_function_arn = aws_lambda_function.instance.arn
#   }
# }

resource "aws_s3_bucket_policy" "s3_bucket_policy" {
  bucket = aws_s3_bucket.instance.id
  policy = data.aws_iam_policy_document.s3_bucket_policy_document.json
}

data "aws_iam_policy_document" "s3_bucket_policy_document" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }

    actions = ["lambda:InvokeFunction"]

    resources = [aws_lambda_function.instance.arn]

    condition {
      test     = "ArnLike"
      variable = "AWS:SourceArn"
      values   = [aws_s3_bucket.instance.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceAccount"
      values   = ["368081326042"]
    }
  }
}
