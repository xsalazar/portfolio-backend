locals {
  api_gateway_origin_id = "portfolio-data-api-gateway-origin-id"
}

resource "aws_apigatewayv2_api" "instance" {
  name                         = "portfolio-api-gateway"
  protocol_type                = "HTTP"
  disable_execute_api_endpoint = false
}

data "aws_acm_certificate" "instance" {
  domain = "backend.xsalazar.com"
}

resource "aws_apigatewayv2_integration" "instance" {
  api_id                 = aws_apigatewayv2_api.instance.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.instance.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "put_instance" {
  api_id    = aws_apigatewayv2_api.instance.id
  route_key = "PUT /"
  target    = "integrations/${aws_apigatewayv2_integration.instance.id}"
}

resource "aws_apigatewayv2_route" "get_instance" {
  api_id    = aws_apigatewayv2_api.instance.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.instance.id}"
}

resource "aws_apigatewayv2_route" "patch_instance" {
  api_id    = aws_apigatewayv2_api.instance.id
  route_key = "PATCH /"
  target    = "integrations/${aws_apigatewayv2_integration.instance.id}"
}

resource "aws_apigatewayv2_stage" "instance" {
  api_id      = aws_apigatewayv2_api.instance.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 50
  }
}
