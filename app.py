from flask import Flask, render_template, request, jsonify
import pandas as pd
import re
import os
import requests

app = Flask(__name__)


DB_FILE = "phishing_db.csv"

def load_database():
    
    encodings = ["utf-8", "utf-8-sig", "utf-16", "latin-1"]
    for enc in encodings:
        try:
            return pd.read_csv(DB_FILE, encoding=enc)
        except FileNotFoundError:
            df = pd.DataFrame(columns=["url", "description"])
            df.to_csv(DB_FILE, index=False, encoding="utf-8")
            return df
        except Exception:
            
            continue

    
    import csv
    try:
        with open(DB_FILE, newline='', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            return pd.DataFrame(rows)
    except FileNotFoundError:
        df = pd.DataFrame(columns=["url", "description"])
        df.to_csv(DB_FILE, index=False, encoding="utf-8")
        return df

phishing_db = load_database()

def is_suspicious_url(url):
    """Check if URL contains suspicious patterns"""
    suspicious_keywords = ["login", "secure", "update", "account", "verify"]
    ip_pattern = r"\b\d{1,3}(?:\.\d{1,3}){3}\b"

    if re.search(ip_pattern, url):
        return True
    for keyword in suspicious_keywords:
        if keyword in url.lower():
            return True
    return False

def detect_phishing_text(text):
    """Detect phishing content in text using keyword analysis"""
    try:
        
        phishing_keywords = [
            "urgent", "immediate", "verify", "account", "password", 
            "click here", "limited time", "act now", "suspended",
            "update your account", "confirm your identity", "security alert"
        ]
        
        text_lower = text.lower()
        
        
        matches = sum(1 for keyword in phishing_keywords if keyword in text_lower)
        
        
        if matches > 2:
            return True
    except Exception as e:
        print(f"Error in text detection: {e}")
    return False

def update_database(url, description):
    """Update the phishing database with new entry"""
    global phishing_db
    
    if not ((phishing_db['url'] == url) & (phishing_db['description'] == description)).any():
        new_entry = pd.DataFrame([{"url": url, "description": description}])
        phishing_db = pd.concat([phishing_db, new_entry], ignore_index=True)
        phishing_db.to_csv(DB_FILE, index=False)

@app.route('/')
def home():
    """Render the main page"""
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan():
    """Scan URL and text for phishing"""
    data = request.get_json()
    url = data.get('url', '')
    text = data.get('text', '')
    
    reason = ""
    suspicious = False
    
    if url and is_suspicious_url(url):
        suspicious = True
        reason = "Suspicious URL pattern detected"
    elif text and detect_phishing_text(text):
        suspicious = True
        reason = "Phishing text pattern detected"
    
    if suspicious:
        update_database(url or text, reason)
        return jsonify({
            "suspicious": True,
            "reason": reason,
            "message": f"Suspicious content detected: {url or text}"
        })
    else:
        return jsonify({
            "suspicious": False,
            "reason": "No threats detected",
            "message": "Content appears safe"
        })

@app.route('/database')
def database():
    """Return the current phishing database"""
    global phishing_db
   
    phishing_db = load_database()
    db = phishing_db
    if db is None or db.empty:
        return jsonify([])
    return jsonify(db.to_dict('records'))


@app.route('/weather')
def weather():
    """Simple weather proxy using Open-Meteo (no API key required).
    Query parameter: q (city name)
    Example: /weather?q=London
    """
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'missing query parameter q (city)'}), 400

    try:
        # Geocoding (open-meteo geocoding)
        geo_resp = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": q, "count": 1},
            timeout=6,
        )
        geo_resp.raise_for_status()
        geo = geo_resp.json()
        results = geo.get('results') or []
        if not results:
            return jsonify({'error': 'location not found'}), 404

        loc = results[0]
        lat = loc.get('latitude')
        lon = loc.get('longitude')
        name = loc.get('name')
        country = loc.get('country')

        # Current weather (open-meteo)
        weather_resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                'latitude': lat,
                'longitude': lon,
                'current_weather': True,
                'timezone': 'auto'
            },
            timeout=6,
        )
        weather_resp.raise_for_status()
        weather_json = weather_resp.json()
        current = weather_json.get('current_weather', {})

        return jsonify({
            'location': f"{name}, {country}",
            'latitude': lat,
            'longitude': lon,
            'current': current
        })

    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'upstream request failed: {e}'}), 502
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)