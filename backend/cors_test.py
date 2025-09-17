import requests

# Test CORS preflight request
headers = {
    'Origin': 'http://localhost:3003',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type',
}

response = requests.options('http://localhost:8000/api/v1/auth/login', headers=headers)
print(f"Status Code: {response.status_code}")
print(f"Headers: {response.headers}")
print(f"Text: {response.text}")