#!/usr/bin/env python3
"""
AgentAuth Full Transaction Test
Tests the complete flow: API key -> Consent -> Transactions -> Verification
"""
import requests
import json
from datetime import datetime

API = "https://characteristic-inessa-agentauth-0a540dd6.koyeb.app"

print("=" * 60)
print("🧪 AgentAuth Full Transaction Test")
print("=" * 60)

# Generate unique user ID for this test
test_user = f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
print(f"\n📝 Test User: {test_user}")

# Step 1: Create an API Key
print("\n" + "─" * 40)
print("STEP 1: Create API Key")
print("─" * 40)

api_key_resp = requests.post(f"{API}/v1/api-keys", json={
    "owner": test_user,
    "name": f"Test Key for {test_user}"
})
if api_key_resp.status_code == 200:
    api_key_data = api_key_resp.json()
    api_key = api_key_data.get("key", "")
    print(f"✅ API Key created: {api_key[:20]}...")
else:
    print(f"⚠️  API key endpoint returned {api_key_resp.status_code}, using demo mode")
    api_key = None

# Headers for authenticated requests
headers = {"X-API-Key": api_key} if api_key else {}

# Step 2: Create a Consent (User authorizes spending)
print("\n" + "─" * 40)
print("STEP 2: Create Consent ($100 limit)")
print("─" * 40)

consent_resp = requests.post(f"{API}/v1/consents", json={
    "user_id": test_user,
    "intent": {"description": "Buy software tools and cloud services"},
    "constraints": {
        "max_amount": 100.00,
        "currency": "USD",
        "allowed_merchants": None,
        "allowed_categories": ["software", "cloud", "saas"]
    },
    "options": {
        "expires_in_seconds": 3600,
        "single_use": False
    },
    "signature": "hmac_test_signature",
    "public_key": "test_public_key"
}, headers=headers)

consent = consent_resp.json()
print(f"✅ Consent ID: {consent.get('consent_id', 'ERROR')}")
constraints = consent.get('constraints', {})
print(f"   Max Amount: ${constraints.get('max_amount', 0)}")
print(f"   Token: {consent.get('delegation_token', '')[:30]}...")

token = consent.get("delegation_token")
consent_id = consent.get("consent_id")

# Step 3: Execute Multiple Transactions
print("\n" + "─" * 40)
print("STEP 3: Execute Transactions")
print("─" * 40)

transactions = [
    {"amount": 9.99, "merchant": "github.com", "desc": "GitHub Copilot subscription"},
    {"amount": 19.00, "merchant": "notion.so", "desc": "Notion Pro Plan"},
    {"amount": 24.00, "merchant": "digitalocean.com", "desc": "DigitalOcean Droplet"},
    {"amount": 45.00, "merchant": "aws.amazon.com", "desc": "AWS S3 Storage"},
    {"amount": 150.00, "merchant": "amazon.com", "desc": "Mechanical Keyboard (OVER LIMIT)"},
]

results = []
for i, tx in enumerate(transactions, 1):
    auth_resp = requests.post(f"{API}/v1/authorize", json={
        "delegation_token": token,
        "action": "payment",
        "transaction": {
            "amount": tx["amount"],
            "currency": "USD",
            "merchant_id": tx["merchant"],
            "description": tx["desc"]
        }
    }, headers=headers)
    
    result = auth_resp.json()
    decision = result.get("decision", "ERROR")
    auth_code = result.get("authorization_code", "N/A")
    reason = result.get("reason", "")
    message = result.get("message", "")
    
    icon = "✅" if decision == "ALLOW" else "❌"
    print(f"{icon} TX{i}: ${tx['amount']:>7.2f} | {tx['merchant']:<20} | {decision}")
    if decision == "ALLOW":
        print(f"       Auth Code: {auth_code}")
    else:
        print(f"       Reason: {reason} - {message}")
    
    results.append({
        "tx": i,
        "amount": tx["amount"],
        "merchant": tx["merchant"],
        "decision": decision,
        "auth_code": auth_code if decision == "ALLOW" else None,
        "reason": reason if decision == "DENY" else None,
        "message": message if decision == "DENY" else None
    })

# Step 4: Check Dashboard Stats
print("\n" + "─" * 40)
print("STEP 4: Dashboard Stats")
print("─" * 40)

stats = requests.get(f"{API}/v1/dashboard/stats", headers=headers).json()
print(f"📊 Total Consents: {stats.get('total_consents', 'N/A')}")
print(f"📊 Active Consents: {stats.get('active_consents', 'N/A')}")
print(f"📊 Consents Today: {stats.get('consents_today', 'N/A')}")
print(f"📊 API Status: {stats.get('api_status', 'N/A')}")

# Step 5: Get Analytics
print("\n" + "─" * 40)
print("STEP 5: Analytics (Last 7 Days)")
print("─" * 40)

# Wait for async authorization queue to flush to database (flushes every 1 second)
import time
print("   ⏳ Waiting 2s for auth queue to flush...")
time.sleep(2)

analytics = requests.get(f"{API}/v1/dashboard/analytics?days=7", headers=headers).json()
for day in analytics.get("analytics", [])[-3:]:
    print(f"   {day['date']}: {day['consents']} consents, {day['authorizations']} auths")

# Step 6: Verify an Authorization (merchant verification)
print("\n" + "─" * 40)
print("STEP 6: Merchant Verification")
print("─" * 40)

successful_auth = next((r for r in results if r["decision"] == "ALLOW"), None)
if successful_auth:
    verify_resp = requests.post(f"{API}/v1/verify", json={
        "authorization_code": successful_auth["auth_code"],
        "merchant_id": "test_merchant",
        "transaction": {
            "amount": successful_auth["amount"],
            "currency": "USD"
        }
    }, headers=headers)
    
    verify = verify_resp.json()
    print(f"🔐 Verification: {'Valid' if verify.get('valid') else 'Invalid'}")
    if verify.get("consent_proof"):
        proof = verify["consent_proof"]
        print(f"   Consent ID: {proof.get('consent_id', 'N/A')}")
        print(f"   User Intent: {proof.get('user_intent', 'N/A')}")
        print(f"   Signature Valid: {proof.get('signature_valid', 'N/A')}")
    if verify.get("error"):
        print(f"   Error: {verify.get('error')}")
else:
    print("⚠️  No successful authorization to verify")

# Summary
print("\n" + "=" * 60)
print("📋 TEST SUMMARY")
print("=" * 60)
allowed = sum(1 for r in results if r["decision"] == "ALLOW")
denied = sum(1 for r in results if r["decision"] == "DENY")
total_amount = sum(r["amount"] for r in results if r["decision"] == "ALLOW")
print(f"   Transactions: {len(results)} total")
print(f"   Allowed: {allowed} (${total_amount:.2f} authorized)")
print(f"   Denied: {denied}")
print(f"   Consent ID: {consent_id}")
print(f"   Test User: {test_user}")
print("\n🎉 Transaction test complete!")
