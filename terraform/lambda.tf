variable "portfolio_api_key" {
  type = string
}

resource "aws_lambda_function" "instance" {
  function_name = "portfolio"
  filename      = "${path.module}/dummy-lambda-package/lambda.zip" // Simple hello world application
  role          = aws_iam_role.instance.arn
  handler       = "app.handler"
  runtime       = "nodejs20.x"
  timeout       = 60  // seconds
  memory_size   = 512 // MB

  environment {
    variables = {
      PORTFOLIO_API_KEY = var.portfolio_api_key
    }
  }

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
