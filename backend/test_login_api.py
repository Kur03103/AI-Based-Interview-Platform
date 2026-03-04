import requests

url = 'http://127.0.0.1:8000/api/auth/login/'
creds = {'username': 'testuser_new', 'password': 'MySecurePassword123!'}
print('posting', creds)
resp = requests.post(url, json=creds)
print('status', resp.status_code, resp.text)
