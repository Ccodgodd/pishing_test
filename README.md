# PhishGuard - Autonomous Phishing Detection System

A responsive web application built with Flask, HTML, CSS, and JavaScript for detecting phishing attempts through URL and text analysis.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **URL Analysis**: Detects suspicious URL patterns (IP addresses, common phishing keywords)
- **Text Analysis**: Analyzes text content for phishing indicators
- **Database Tracking**: Maintains a record of detected phishing attempts
- **Real-time Scanning**: Instant feedback on potential threats

## Technologies Used

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **Data Processing**: Pandas
- **Machine Learning**: Transformers (simplified keyword-based approach for compatibility)

## Installation

1. Clone the repository
2. Install required packages:
   ```
   pip install flask pandas transformers torch
   ```
3. Run the application:
   ```
   python app.py
   ```
4. Access the application at `http://127.0.0.1:5000`

## How It Works

1. Enter a URL or text content to analyze
2. The system checks for suspicious URL patterns:
   - IP addresses in URLs
   - Common phishing keywords (login, secure, update, account, verify)
3. Text content is analyzed for phishing indicators:
   - Urgent language
   - Requests for personal information
   - Suspicious calls to action
4. Potential threats are flagged and added to the database

## Project Structure

```
project/
├── app.py              # Main Flask application
├── phishing_db.csv     # Database of detected threats
├── templates/
│   └── index.html      # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css   # Styling
│   └── js/
│       └── script.js   # Client-side functionality
└── README.md
```

## API Endpoints

- `GET /` - Serve the main web interface
- `POST /scan` - Scan URL/text for phishing indicators
- `GET /database` - Retrieve the phishing database

## License

This project is for educational purposes and demonstrates phishing detection techniques.