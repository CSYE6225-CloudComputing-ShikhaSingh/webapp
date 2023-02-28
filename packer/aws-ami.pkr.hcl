
locals { timestamp = regex_replace(timestamp(), "[- TZ:]", "") }

variable "instance" {
  type    = string
  default = "t2.micro"
}
variable "profile" {
  type    = string
  default = "dev"
}

variable "source_ami" {
  type = string
}
variable "ssh_username" {
  type    = string
  default = "ec2-user"

}
variable "ami_users" {
  type = list(string)
}
variable "vpc_region" {
  type = string
}
variable "vpc_id" {
  type = string
}
variable "ami_description" {
  type    = string
  default = "EC2 AMI for CSYE 6225"
}
variable "ami_prefix" {
  type    = string
  default = "csye6225_ami"
}
variable "GITHUB_PATH" {
  default = env("GITHUB_REPO_PATH")
}
variable "launch_permissions" {
  type    = string
  default = "private"
}
source "amazon-ebs" "ec2" 
  ami_name        = "${var.ami_prefix}-${local.timestamp}"
  ami_description = var.ami_description
  instance_type   = var.instance
  profile         = var.profile
  ssh_username    = var.ssh_username
  ami_users       = var.ami_users
  region          = var.vpc_region
  source_ami      = var.source_ami
  vpc_id          = var.vpc_id
  associate_public_ip_address = true
    vpc_filter {
    filters = {
      "tag:Name": "default-vpc",
      "isDefault": "true",
    }
  }
  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"

  }
}

build {
  sources = [
    "source.amazon-ebs.ec2"
  ]

  provisioner "file" {
    destination = "/tmp/"
    source      = "${var.GITHUB_PATH}/appDir/webapp.zip"
  }

  provisioner "shell" {
    scripts = [
      "./packer/provisioner.sh",
      "./packer/script.sh"
    ]
  }

}

