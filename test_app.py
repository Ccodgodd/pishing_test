import requests
import json

# Test the Flask application endpoints

# Test data
test_data = [
    {
        "url": "http://secure-login-example.com", 
        "text": "Please verify your account immediately!"
    },
    {
        "url": "http://192.168.1.10/phishing", 
        "text": "Update your password now!"
    },
    {
        "url": "http://trusted-site.com", 
        "text": "Welcome to our service."
    }
]

print("Testing PhishGuard Application")
print("=" * 40)

# Test the scan endpoint
for i, data in enumerate(test_data, 1):
    print(f"\nTest Case {i}:")
    print(f"URL: {data['url']}")
    print(f"Text: {data['text']}")
    
    try:
        response = requests.post(
            'http://127.0.0.1:5000/scan',
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {result['message']}")
            print(f"Suspicious: {result['suspicious']}")
        else:
            print(f"Error: HTTP {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

print("\n" + "=" * 40)
print("Testing complete!")