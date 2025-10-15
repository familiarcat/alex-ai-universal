#!/bin/bash

set -euo pipefail

# Recover SSH access by replacing user data to append a public key for ubuntu on next boot
# Requires: AWS CLI configured, instance ID, availability zone, and a public key file path

IID="${1:-i-0afdf313f61f22df0}"
AZ="${2:-us-east-2b}"
PUBFILE="${3:-$HOME/.ssh/id_ed25519.pub}"

if [ ! -s "$PUBFILE" ]; then
  echo "❌ Public key not found or empty: $PUBFILE"
  exit 1
fi

PUBKEY=$(cat "$PUBFILE")

TMP=/tmp/user-data-ssh.txt
cat > "$TMP" <<EOF
#cloud-config
runcmd:
  - mkdir -p /home/ubuntu/.ssh
  - echo "$PUBKEY" >> /home/ubuntu/.ssh/authorized_keys
  - chown -R ubuntu:ubuntu /home/ubuntu/.ssh
  - chmod 700 /home/ubuntu/.ssh
  - chmod 600 /home/ubuntu/.ssh/authorized_keys
  - systemctl restart ssh || service ssh restart || true
EOF

echo "Uploading user data to instance: $IID"
aws ec2 modify-instance-attribute --instance-id "$IID" --user-data "Value=$(base64 < "$TMP")"

echo "Rebooting instance..."
aws ec2 reboot-instances --instance-ids "$IID" >/dev/null

echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids "$IID"

IP=$(aws ec2 describe-instances --instance-ids "$IID" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "Public IP: $IP"

echo "Waiting for SSH to accept connections..."
for i in {1..30}; do
  nc -z -w 3 "$IP" 22 && echo "SSH port open" && break || sleep 3
done

echo "Try SSH now:"
ssh -o StrictHostKeyChecking=no ubuntu@"$IP" exit && echo "✅ SSH recovered" || { echo "❌ SSH still failing"; exit 2; }

echo "Done."


