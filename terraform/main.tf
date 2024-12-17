terraform {
  required_version = "~> 1.10.2"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.81.0"
    }
  }
  backend "s3" {
    bucket = "xsalazar-terraform-state"
    key    = "portfolio/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = "us-west-2"
  default_tags {
    tags = {
      CreatedBy = "terraform"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
  default_tags {
    tags = {
      CreatedBy = "terraform"
    }
  }
}

output "lambda_function" {
  value = aws_lambda_function.instance.function_name
}
