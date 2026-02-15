import requests

url = "http://127.0.0.1:8000/tourism/check"
params = {"origin": "India", "destination": "France"}

# We are ONLY providing the reason, leaving Age and Income empty
data = {
    "reason": "Work/Digital Nomad"
}

response = requests.post(url, params=params, json=data)
res_json = response.json()

print(f"STATUS: {res_json['status']}")
if res_json['status'] == "INCOMPLETE":
    print("\n⚠️ ACTION REQUIRED: The AI needs more info:")
    for field, reason in res_json['expert_analysis']['awaiting_feedback'].items():
        print(f" - {field.upper()}: {reason}")
else:
    print("\n✅ SUCCESS: Full report generated.")