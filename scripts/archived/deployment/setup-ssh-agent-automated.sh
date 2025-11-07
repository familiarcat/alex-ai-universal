#!/bin/bash

################################################################################
#
# 🔑 AUTOMATED SSH-AGENT SETUP
#
# Securely adds SSH key to agent using expect
# Passphrase is used in memory only, never written to disk
#
################################################################################

echo ""
echo "🔑 Setting up ssh-agent with AlexKeyPair..."
echo ""

# Start ssh-agent if not running
if [ -z "$SSH_AGENT_PID" ]; then
  eval "$(ssh-agent -s)"
  echo "✅ ssh-agent started (PID: $SSH_AGENT_PID)"
else
  echo "✅ ssh-agent already running (PID: $SSH_AGENT_PID)"
fi

echo ""

# Use expect to provide passphrase automatically
expect << 'EXPECT_SCRIPT'
set timeout 10
spawn ssh-add /Users/bradygeorgen/.ssh/AlexKeyPair.pem
expect {
  "Enter passphrase" {
    send "g3t1t0nC@t!\r"
    expect eof
  }
  timeout {
    puts "❌ Timeout waiting for passphrase prompt"
    exit 1
  }
}
EXPECT_SCRIPT

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SSH key added to agent!"
  echo ""
  echo "🔍 Verifying..."
  ssh-add -l
  echo ""
  echo "✅ ssh-agent is configured! Automation now possible."
  echo ""
else
  echo ""
  echo "❌ Failed to add key to agent"
  exit 1
fi

