// DOM Elements
const scanSection = document.getElementById('scan-section');
const databaseSection = document.getElementById('database-section');
const aboutSection = document.getElementById('about-section');

const scanLink = document.getElementById('scan-link');
const databaseLink = document.getElementById('database-link');
const aboutLink = document.getElementById('about-link');

const navUnderline = document.querySelector('.nav-underline');

const scanForm = document.getElementById('scan-form');
const urlInput = document.getElementById('url-input');
const textInput = document.getElementById('text-input');
const resultContainer = document.getElementById('result-container');
const resultContent = document.getElementById('result-content');

const refreshDbBtn = document.getElementById('refresh-db');
const clearDbBtn = document.getElementById('clear-db');
const databaseBody = document.getElementById('database-body');
const noDataMessage = document.getElementById('no-data-message');
// Weather + Clock elements
const weatherInput = document.getElementById('weather-input');
const weatherBtn = document.getElementById('weather-btn');
const weatherDisplay = document.getElementById('weather-display');
const clockEl = document.getElementById('clock');
const dateEl = document.getElementById('date');

// Navigation Functions
function showSection(section) {
    // Hide sections (use class toggles so CSS animations can apply)
    [scanSection, databaseSection, aboutSection].forEach(s => s.classList.add('hidden'));
    // Remove active class from all links
    [scanLink, databaseLink, aboutLink].forEach(l => l.classList.remove('active'));
    // Show selected section
    section.classList.remove('hidden');
    // position nav underline under active
    updateNavUnderline();
}

scanLink.addEventListener('click', function(e) {
    e.preventDefault();
    showSection(scanSection);
    this.classList.add('active');
});

databaseLink.addEventListener('click', function(e) {
    e.preventDefault();
    showSection(databaseSection);
    this.classList.add('active');
    loadDatabase();
});

aboutLink.addEventListener('click', function(e) {
    e.preventDefault();
    showSection(aboutSection);
    this.classList.add('active');
});

// Nav underline positioning
function updateNavUnderline(){
    const active = document.querySelector('.nav-list a.active');
    if(!active || !navUnderline) return;
    const rect = active.getBoundingClientRect();
    const parentRect = active.closest('.nav-list').getBoundingClientRect();
    const left = rect.left - parentRect.left;
    navUnderline.style.transform = `translateX(${left}px)`;
    navUnderline.style.width = `${rect.width}px`;
}

// Scan Form Submission
scanForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    const text = textInput.value.trim();
    
    if (!url && !text) {
        showResult('Please enter either a URL or text content to scan.', 'warning');
        return;
    }
    
    // Show loading state
    const scanButton = document.getElementById('scan-button');
    const originalText = scanButton.innerHTML;
    scanButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    scanButton.disabled = true;
    
    // Send data to backend
    fetch('/scan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.suspicious) {
            showResult(data.message, 'danger', data.reason);
        } else {
            showResult(data.message, 'safe', data.reason);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showResult('An error occurred during scanning. Please try again.', 'warning');
    })
    .finally(() => {
        // Restore button state
        scanButton.innerHTML = originalText;
        scanButton.disabled = false;
    });
});

// Show Result Function
function showResult(message, type, reason = '') {
    resultContainer.classList.remove('hidden');

    let icon = '';
    if (type === 'safe') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
    else if (type === 'danger') icon = '<i class="fas fa-exclamation-circle"></i>';

    resultContent.innerHTML = `
        <div class="result-${type}">
            <h3>${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <p>${message}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
    `;

    // Smooth reveal and focus
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Database Functions
function loadDatabase() {
    fetch('/database')
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            databaseBody.innerHTML = '';
            noDataMessage.classList.remove('hidden');
            return;
        }
        
        noDataMessage.classList.add('hidden');
        let tableRows = '';
        
        data.forEach((item, index) => {
            tableRows += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.url || 'N/A'}</td>
                    <td>${item.description}</td>
                    <td>${item.date || new Date().toLocaleDateString()}</td>
                </tr>
            `;
        });
        
        databaseBody.innerHTML = tableRows;
    })
    .catch(error => {
        console.error('Error loading database:', error);
        databaseBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
    });
}

refreshDbBtn.addEventListener('click', function() {
    loadDatabase();
});

clearDbBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear the entire database? This action cannot be undone.')) {
        // In a real implementation, you would call an endpoint to clear the database
        // For now, we'll just reload the empty database
        fetch('/database')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                databaseBody.innerHTML = '';
                noDataMessage.classList.remove('hidden');
            }
        });
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load database on initial page load
    loadDatabase();
    // start clock
    startClock();
    // wire weather
    weatherBtn.addEventListener('click', function() {
        const c = (weatherInput.value || '').trim() || 'London';
        fetchWeather(c);
    });
    // initial weather
    fetchWeather(weatherInput.value.trim() || 'London');
    // ensure nav underline is positioned after load
    setTimeout(updateNavUnderline, 200);
});

// Clock
function startClock(){
    function tick(){
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString();
        dateEl.textContent = now.toLocaleDateString(undefined, {weekday:'long', month:'short', day:'numeric', year:'numeric'});
    }
    tick();
    setInterval(tick, 1000);
}

// Weather
function fetchWeather(city){
    weatherDisplay.textContent = 'Loading...';
    fetch('/weather?q=' + encodeURIComponent(city))
    .then(r => r.json())
    .then(data => {
        if(data.error){
            weatherDisplay.textContent = 'Error: ' + data.error;
            return;
        }
        const cur = data.current || {};
        const temp = cur.temperature !== undefined ? cur.temperature + '°C' : 'N/A';
        const wind = cur.windspeed !== undefined ? cur.windspeed + ' km/h' : 'N/A';
        const time = cur.time || '';
        weatherDisplay.innerHTML = `
            <div style="font-weight:700;color:#eaf6ff">${data.location}</div>
            <div style="margin-top:6px">Temp: ${temp} • Wind: ${wind}</div>
            <div style="margin-top:6px;font-size:.9rem;color:var(--muted)">${time}</div>
        `;
    })
    .catch(err => {
        weatherDisplay.textContent = 'Unable to fetch weather';
        console.error(err);
    });
}
