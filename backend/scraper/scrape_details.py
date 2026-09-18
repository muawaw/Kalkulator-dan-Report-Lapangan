import requests
import os
from dotenv import load_dotenv

BASE_URL = os.getenv("BASE_URL")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "X-Requested-With": "XMLHttpRequest"
}

# test_venue_id = "1368"
test_venue_id = "71"

# Fetch Field List
url = f"{BASE_URL}/venues-ajax/{test_venue_id}/get-field-list?venue_id={test_venue_id}"
res = requests.get(url, headers=headers)

if res.status_code == 200:
    data = res.json()
    print(f"Status: {data.get('message')}") # e.g. 'Venue field successful fetched'[cite: 1]
    
    # Print discovered fields for this venue
    fields = data.get("data", [])
    print(f"Found {len(fields)} fields for venue_id {test_venue_id}:")
    for f in fields:
        print(f" - Field ID: {f.get('id')} | Name: {f.get('name')}")
else:
    print(f"Failed with status: {res.status_code}")