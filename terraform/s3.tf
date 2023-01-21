resource "aws_s3_bucket" "instance" {
  bucket = "portfolio-data"
}

resource "aws_s3_bucket_notification" "instance" {
  bucket = aws_s3_bucket.instance.bucket

  lambda_function {
    events              = ["s3:ObjectCreated:*"]
    lambda_function_arn = aws_lambda_function.instance.arn
  }
}
