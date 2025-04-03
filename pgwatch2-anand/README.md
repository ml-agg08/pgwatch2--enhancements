# PGWATCH2 - IMPROVEMENTS&LEARNINGS

## 📊 PGWatch2 - Downloadable Database Summary Feature

### Overview
This enhancement allows users to download a summary of database statistics in a text format directly from the PGWatch2 UI. Users can select a database and click the **"Download as Text"** button to retrieve an overview of key metrics.

### 🎨 UI Changes (`webpy/templates/stats-summary.html`)
#### ✅ Before
```html
<form action="/stats-summary" method="get">
  <select name="dbname">
    <option></option>
    {% for db in dbnames %}
    <option value="{{db}}" {% if db == dbname %}selected{% endif %}>{{db}}</option>
    {% endfor %}
  </select>
  <input type="submit" name="show" value="Show">
</form>
```

#### 🛠️ After
```html
<form action="/stats-summary" method="get">
  <select name="dbname">
    <option></option>
    {% for db in dbnames %}
    <option value="{{db}}" {% if db == dbname %}selected{% endif %}>{{db}}</option>
    {% endfor %}
  </select>
  <input type="submit" name="show" value="Show">
  <input type="submit" name="download" value="Download as Text" class="btn btn-secondary">
</form>
```

### ✨ Changes
- **Added**: "Download as Text" button.
- **Functionality**: When clicked, the backend serves a `.txt` file containing database stats.
- **UI Styling**: Uses Bootstrap’s `btn btn-secondary` class.

### 🔧 Backend Changes (`webpy/web.py`)
#### ✅ Before
```python
@logged_in
@cherrypy.expose
def stats_summary(self, **params):
    # Existing logic for fetching and displaying database summary
```

#### 🛠️ After
```python
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
```

### Screenshots (before vs after)

## Before

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/WhatsApp%20Image%202025-04-03%20at%2011.26.53_c521ed35.jpg?raw=true)

## After

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/Screenshot%20from%202025-03-29%2005-05-59.png?raw=true)

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/Screenshot%20from%202025-03-29%2005-06-10.png?raw=true)

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/Screenshot%20from%202025-03-29%2005-06-30.png?raw=true)

### 🚀 Feature Benefits
- **Quickly export** database statistics for offline review.
- **Lightweight & easy-to-use**, requiring no extra dependencies.
- **Enhances user experience** by providing an intuitive way to retrieve insights.

---

## 🌗 PGWatch2 Dark/Light Mode Enhancement

### 🚀 Overview
This update introduces a **Dark/Light Theme Toggle** for the PGWatch2 Web UI (port 8080). Users can seamlessly switch themes, with preferences stored in `localStorage` for persistence.

### 🛠️ Implementation Details
#### 📁 CSS Changes: `static/custom.css`
Defines CSS variables for both themes:
```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #212529;
}

[data-theme="dark"] {
    --bg-primary: #212529;
    --bg-secondary: #343a40;
    --text-primary: #f8f9fa;
}
```

#### 📁 JavaScript: Theme Toggle Logic
```js
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}
```

#### 📁 HTML Changes
```html
<li class="nav-item">
    <a class="nav-link" href="#" onclick="toggleTheme(); return false;">
        <i id="theme-icon" class="fas fa-moon"></i>
    </a>
</li>
```

### Screenshots (before vs after)

## Before

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/WhatsApp%20Image%202025-03-27%20at%2015.20.21_bc6a981a.jpg?raw=true)

## After

# Light mode

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/Screenshot%20from%202025-03-29%2005-04-59.png?raw=true)

# Dark Mode

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/Screenshot%20from%202025-03-29%2005-05-09.png?raw=true)

# Toggle Button

![Description](https://github.com/ml-agg08/pgwatch2--enhancements/blob/main/pgwatch2-anand/Screenshot%20from%202025-03-29%2005-05-37.png?raw=true)



### 🔍 Testing Checklist
✅ Theme persists after reload  
✅ Toggle button works instantly  
✅ Icon updates correctly (moon/sun switch)  
✅ Forms, tables, modals, dropdowns styled correctly in both modes  

---

## 🔧 PGWatch2 Custom Installation: Troubleshooting and Fixes

### 1️⃣ Setting Up PostgreSQL Database and User
#### 🛠 Error
Permission issues when creating the database and user.
#### ✅ Solution
```sh
psql -c "create user pgwatch2 password 'xyz'"
psql -c "create database pgwatch2 owner pgwatch2"
```

### 2️⃣ Database Connection and Authentication Issues
#### 🛠 Problem
`FATAL: password authentication failed for user "pgwatch2"`
#### ✅ Solution
Modify `pg_hba.conf`:
```sh
sudo nano /etc/postgresql/[version]/main/pg_hba.conf
```
Update:
```
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```
Restart PostgreSQL:
```sh
sudo systemctl restart postgresql
```

### 3️⃣ Bootstrap the Metrics Storage Database
#### 🛠 Problem
`ERROR: permission denied to create database`
#### ✅ Solution
```sh
psql -U postgres -c "ALTER USER pgwatch2 CREATEDB"
psql -c "create database pgwatch2_metrics owner pgwatch2"
```

### 4️⃣ Setting Up Metric Storage Schema
#### ✅ Solution
```sh
cd /etc/pgwatch2/sql/metric_store
psql -f roll_out_metric_time.psql pgwatch2_metrics
```

### 5️⃣ Running the PGWatch2 Web Application
#### 🛠 Problem
`psycopg2.OperationalError: connection to server at "localhost" failed`
#### ✅ Solution
Ensure proper authentication in `pg_hba.conf`.

---

## 📌 Conclusion
This document covers two key enhancements: **Downloadable Database Summary & Dark/Light Mode Toggle**, along with a structured **troubleshooting guide** for custom installations. These features significantly improve usability and flexibility within PGWatch2.

🚀 **Enhancements bring better UX & troubleshooting simplifies installation.** 🎯

