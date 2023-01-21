resource "aws_lambda_function" "instance" {
  function_name = "portfolio"
  filename      = "${path.module}/dummy-lambda-package/lambda.zip" // Simple hello world application
  role          = aws_iam_role.instance.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30  // seconds
  memory_size   = 128 // MB

  // Since CI/CD will deploy this application externally, these do not need to be tracked after creation
  lifecycle {
    ignore_changes = [
      last_modified,
      source_code_hash,
      source_code_size
    ]
  }
}

resource "aws_cloudwatch_log_group" "instance" {
  name              = "/aws/lambda/${aws_lambda_function.instance.function_name}"
  retention_in_days = 30 // days
}
