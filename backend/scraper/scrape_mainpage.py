import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL")

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
}

ajax_headers = headers.copy()
ajax_headers["X-Requested-With"] = "XMLHttpRequest"

total_pages = 20
venues_data = []

print(f"=== Starting Scraper across {total_pages} Pages ===")

for page in range(1, total_pages + 1):
    search_url = f"{BASE_URL}/venues?sortby=2&tipe=venue&cabor=7&page={page}"
    print(f"\n[Page {page}/{total_pages}] Scraping main search page...")
    
    try:
        response = requests.get(search_url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            print(f"  [ERROR] Page {page} failed with status {response.status_code}")
            continue
            
        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.find_all("div", class_=lambda c: c and "venue-card-item" in c)
        
        for card in cards:
            # 1. Extract Venue ID from id="venue-XXXX"
            card_id = card.get("id", "")
            venue_id = card_id.replace("venue-", "") if "venue-" in card_id else None
            
            card_body = card.find("div", class_="card-body")
            if not card_body or not venue_id:
                continue

            # 2. Extract Venue Name
            name_el = card_body.find("h5", class_=lambda c: c and "turncate" in c)
            venue_name = name_el.get_text(strip=True) if name_el else None
            
            if not venue_name:
                continue
                
            # 3. Extract Location
            location_el = card_body.find("h5", class_=lambda c: c and "s14-400" in c)
            location = location_el.get_text(strip=True) if location_el else None
            
            # 4. Extract Starting Price
            price_el = card_body.find("span", class_=lambda c: c and "s16-500" in c)
            starting_price = price_el.get_text(strip=True) if price_el else None
            
            # 5. Fetch Voucher List via AJAX for this specific venue_id
            voucher_code = "N/A"
            voucher_name = "N/A"
            
            voucher_url = f"{BASE_URL}/venues-ajax/{venue_id}/get-voucher-list?venue_id={venue_id}"
            try:
                v_res = requests.get(voucher_url, headers=ajax_headers, timeout=5)
                if v_res.status_code == 200:
                    v_json = v_res.json()
                    # Expecting data list or array in JSON response
                    vouchers = v_json.get("data", []) if isinstance(v_json, dict) else v_json
                    
                    if vouchers and len(vouchers) > 0:
                        first_voucher = vouchers[0]
                        voucher_code = first_voucher.get("voucher_code", "N/A") or first_voucher.get("code", "N/A")
                        voucher_name = first_voucher.get("name", "N/A")
            except Exception:
                pass # Fallback to "N/A" if request fails or has no vouchers
            
            venues_data.append({
                "venue_id": venue_id,
                "venue_name": venue_name,
                "location": location,
                "starting_price": starting_price,
                "voucher_code": voucher_code,
                "voucher_name": voucher_name
            })
            
            print(f"  -> Extracted ID [{venue_id}] | {venue_name} | Voucher: {voucher_code}")
            
        time.sleep(0.3)
        
    except Exception as e:
        print(f"  [EXCEPTION] Error processing page {page}: {e}")

print(f"\n=== Scraping Finished. Total Venues Collected: {len(venues_data)} ===")

# Export to CSV
csv_filename = "rent_tennis_venues.csv"
df = pd.DataFrame(venues_data)
df.to_csv(csv_filename, index=False, encoding="utf-8-sig")
print(f"[EXPORT] Saved CSV to {csv_filename}")

# Export to JSON
json_filename = "rent_tennis_venues.json"
with open(json_filename, "w", encoding="utf-8") as f:
    json.dump(venues_data, f, ensure_ascii=False, indent=2)
print(f"[EXPORT] Saved JSON to {json_filename}")