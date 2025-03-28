
1.  
📊 pgwatch2 - Downloadable Database Summary Feature
Overview
This enhancement allows users to download a summary of database statistics in a text format directly from the pgwatch2 UI. Users can select a database and click the "Download as Text" button to retrieve an overview of key metrics.

🎨 UI Changes (webpy/templates/stats-summary.html)
✅ Before
<form action="/stats-summary" method="get">
  <select name="dbname">
    <option></option>
    {% for db in dbnames  %}
    <option value="{{db}}" {% if db == dbname %}selected{% endif %}>{{db}}</option>
    {% endfor %}
  </select>
  <input type="submit" name="show" value="Show">
</form>

🛠️ After
<form action="/stats-summary" method="get">
  <select name="dbname">
    <option></option>
    {% for db in dbnames  %}
    <option value="{{db}}" {% if db == dbname %}selected{% endif %}>{{db}}</option>
    {% endfor %}
  </select>
  <input type="submit" name="show" value="Show">
  <input type="submit" name="download" value="Download as Text" class="btn btn-secondary">
</form>

✨ Changes
Added: Download as Text button.


Functionality: When clicked, the backend serves a .txt file containing database stats.


UI Styling: Uses Bootstrap’s btn btn-secondary class.



🔧 Backend Changes (webpy/web.py)
✅ Before
@logged_in
@cherrypy.expose
def stats_summary(self, **params):
    # Existing logic for fetching and displaying database summary

🛠️ After
@logged_in
@cherrypy.expose
def stats_summary(self, **params):
    download = params.get('download')  # Detect download request
    
    # Fetch data as usual
    
    if dbname and download:  # Handle text file download
        text_content = f"Database Overview for {dbname}\n"
        text_content += "=" * 50 + "\n\n"
        text_content += "Attribute\tLast 7d avg\tLast 24h avg\tLast 1h avg\n"
        text_content += "-" * 50 + "\n"
        for key, values in data:
            text_content += f"{key}\t{values[0]}\t{values[1]}\t{values[2]}\n"
        
        cherrypy.response.headers['Content-Type'] = 'text/plain'
        cherrypy.response.headers['Content-Disposition'] = f'attachment; filename="{dbname}_overview.txt"'
        return text_content

✨ Changes
Detects download parameter in the request.


Formats the summary as tab-separated text.


Sets response headers to trigger file download instead of rendering a webpage.



🚀 Feature Benefits
Quickly export database statistics for offline review.


Lightweight & easy-to-use, requiring no extra dependencies.


Enhances user experience by providing an intuitive way to retrieve insights.




Pgwatch2 Dark/Light Mode Enhancement
🚀 Overview
This update introduces a Dark/Light Theme Toggle for the Pgwatch2 Web UI (port 8080). Users can seamlessly switch themes, with preferences stored in localStorage for persistence. The implementation includes:
Custom CSS using theme variables


JavaScript logic for theme toggling & icon updates


HTML modifications to integrate the toggle button



🛠️ Implementation Details
📁 CSS Changes: static/custom.css
Purpose:
Defines CSS variables for both themes, ensuring dynamic theme switching.
Added CSS Variables:
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --border-color: #dee2e6;
    --navbar-bg: #f8f9fa;
    --card-bg: #ffffff;
    --table-bg: #ffffff;
    --table-border: #dee2e6;
    --hover-bg: #f8f9fa;
}

[data-theme="dark"] {
    --bg-primary: #212529;
    --bg-secondary: #343a40;
    --text-primary: #f8f9fa;
    --text-secondary: #adb5bd;
    --border-color: #495057;
    --navbar-bg: #343a40;
    --card-bg: #343a40;
    --table-bg: #343a40;
    --table-border: #495057;
    --hover-bg: #495057;
}

Applied Variables for UI Components:
body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.navbar {
    background-color: var(--navbar-bg) !important;
}

.card, .dropdown-menu, .modal-content {
    background-color: var(--card-bg);
    color: var(--text-primary);
    border-color: var(--border-color);
}


📁 JavaScript: Theme Toggle Logic
Theme Initialization on Page Load:
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

Toggle Theme Function:
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

Icon Update Function:
function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}


📁 HTML Template Changes
1. Add Custom Styles & FontAwesome
<link rel="stylesheet" href="/static/custom.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

2. Navbar Toggle Button
<li class="nav-item">
    <a class="nav-link" href="#" onclick="toggleTheme(); return false;">
        <i id="theme-icon" class="fas fa-moon"></i>
    </a>
</li>

3. Modified Templates
templates/dbs.html


templates/metrics.html


templates/stats-summary.html


templates/login.html (No toggle button, but includes theme logic for future compatibility)



🎨 UI Impact Summary
Component
Light Mode
Dark Mode
Background
White / Light Gray
Dark Gray / Black
Text
Black / Gray
White / Light Gray
Navbar
Light Gray Background
Dark Gray Background
Cards/Tables
White with Light Borders
Dark Background with Dark Borders
Dropdowns
Light BG and Border
Dark BG and Border
Forms
Light Input BG
Dark Input BG
Hover Effects
Light Gray Highlight
Darker Gray Highlight


🔍 Testing Checklist
✅ Theme persists after reload


✅ Toggle button works instantly


✅ Icon updates correctly (moon/sun switch)


✅ Forms, tables, modals, dropdowns styled correctly in both modes



3. 

PGWatch2 Custom Installation: Troubleshooting and Fixes
Introduction
This document details the troubleshooting process and solutions encountered during a custom installation of PGWatch2 on Ubuntu without using Docker. PGWatch2 is a powerful PostgreSQL monitoring tool, but manual installation posed several challenges related to authentication, permissions, and configuration. Below is a structured walkthrough of the errors encountered and their corresponding resolutions.

1. Setting Up PostgreSQL Database and User
Error
After installing PostgreSQL, I encountered permission issues while creating the required database and user for PGWatch2.
Solution
The following steps were taken to create the necessary PostgreSQL user and database:
Create the user:

 psql -c "create user pgwatch2 password 'xyz'"


Create the database:

 psql -c "create database pgwatch2 owner pgwatch2"


After executing these commands, PostgreSQL was expected to set up the required user and database.

2. Database Connection and Authentication Issues
Problem
When attempting to connect using psql, I received the following error:
FATAL: password authentication failed for user "pgwatch2"

Solution
Modify the pg_hba.conf File:

 sudo nano /etc/postgresql/[version]/main/pg_hba.conf
 (Replace [version] with your PostgreSQL version, e.g., 13.)


Update the Configuration:

 host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust


Restart PostgreSQL:

 sudo systemctl restart postgresql


After applying these changes, the authentication issue was resolved.

3. Bootstrap the Metrics Storage Database
Problem
Attempting to create the pgwatch2_metrics database resulted in a permission error:
ERROR:  permission denied to create database

Solution
Grant CREATEDB Privilege to the User:

 psql -U postgres -c "ALTER USER pgwatch2 CREATEDB"


Create the Database:

 psql -c "create database pgwatch2_metrics owner pgwatch2"


With the correct privileges, the database creation was successful.

4. Setting Up Metric Storage Schema
Problem
Errors related to missing tables and schemas appeared while setting up metric storage.
Solution
Navigate to the Schema Scripts Directory:

 cd /etc/pgwatch2/sql/metric_store


Execute the Schema Setup Script:

 psql -f roll_out_metric_time.psql pgwatch2_metrics


This successfully initialized the metric storage schema.

5. Running the PGWatch2 Web Application
Problem
Starting the PGWatch2 web application with the following command resulted in an authentication error:
python3 web.py --datastore=postgres --pg-metric-store-conn-str="dbname=pgwatch2_metrics user=pgwatch2 password=xyz"

Error Message:
psycopg2.OperationalError: connection to server at "localhost" (127.0.0.1), port 5432 failed: FATAL:  password authentication failed for user "pgwatch2"

Solution
Ensure Proper Authentication in pg_hba.conf (as detailed in Section 2).


Restart PostgreSQL:

 sudo systemctl restart postgresql


After applying these changes, the PGWatch2 web application started successfully.

Conclusion
Key takeaways from this troubleshooting process:
Ensure PostgreSQL users have appropriate privileges for database creation and schema execution.


Modify pg_hba.conf to use trust authentication where necessary.


Always restart PostgreSQL after configuration changes.


Following these steps allowed for a successful custom installation of PGWatch2 without Docker.

