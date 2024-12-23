# Multistreaming Server Setup (Linux)

## Prerequisites
- Registered domain
- SSL/TLS certificate (e.g., <a href="#ssl-certificate-generation-with-lets-encrypt">Let's Encrypt Guide</a>)
- Chrome extension: <a href="https://github.com/itzsmoki/Keygram">Keygram</a>
- Flask application with Gunicorn and Nginx (<a href="https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-gunicorn-and-nginx-on-ubuntu-22-04">Guide</a>)


---

## NGINX Installation and Configuration

### 1. Install NGINX
```bash
sudo apt install -y libnginx-mod-rtmp nginx
```
### 2. Configure NGINX
Edit the NGINX configuration file:
```bash
sudo nano /etc/nginx/nginx.conf
```
Configure the RTMP block:
```nginx
rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record off;
            on_publish http://127.0.0.1:8334/auth;
            push rtmp://<streaming-platform-domain>/<key>; # RTMP template
            push rtmp://127.0.0.1:19350/rtmp/; # RTMPS template for stunnel
        }

    }
}
```
Configure the HTTP block:
```nginx
http {
    server {
        listen 8334;
        server_name 127.0.0.1;

        location /auth {
            proxy_buffering off;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_pass https://<your-server-domain>/auth;
        }
    }
}
```
Save with `CTRL + S` and exit with `CTRL + X`.
## Stunnel Installation and Configuration

### 1. Install Stunnel
```bash
sudo apt install stunnel4
```
### 2. Configure Stunnel
Edit the Stunnel configuration file:
```bash
sudo nano /etc/stunnel/stunnel.conf
```
Add the following:
```ini
pid = /var/run/stunnel/stunnel.pid
output = /var/log/stunnel/stunnel.log
[instagram-live]
client = yes
accept = 127.0.0.1:19350
connect = edgetee-upload-mxp2-1.xx.fbcdn.net:443 # Example for Instagram
verifyChain = no
```
### 3. Create Required Directories
```bash
sudo mkdir -p /var/run/stunnel
sudo mkdir -p /var/log/stunnel
```
### 4. Set Permissions
```bash
sudo chown -R stunnel4:stunnel4 /var/run/stunnel
sudo chown -R stunnel4:stunnel4 /var/log/stunnel
```
### 5. Restart Services
```bash
sudo systemctl restart nginx
sudo systemctl restart stunnel4
```
## Authentication with Server Key
### 1. Install Flask and Flask-Cors
Install `pip` if not already installed:
```bash
sudo apt install pip

```
Install Flask and Flask-Cors:
```bash
sudo pip install Flask Flask-Cors
```
### 2. Create the Flask Authentication Script
Create a Python file (e.g., `auth.py`) and add the following code:
```python
from flask import Flask, request, Response
import subprocess
from flask_cors import CORS

SECRET = "<your-key>"

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "https://www.instagram.com"}})

@app.route("/auth", methods=["POST"])
def auth():
    key = request.form.to_dict().get("name")
    if key == SECRET:
        return Response(status=200)
    else:
        return Response(status=403)

@app.route('/update_key', methods=['POST'])
def update_stream_key():
    data = request.get_json()
    stream_key = data.get('streamKey')
    key = data.get('serverKey')
    spaces = ' ' * 12

    if key == SECRET:
        nginx_conf_path = '/etc/nginx/nginx.conf'
        with open(nginx_conf_path, 'r') as file:
            lines = file.readlines()

        updated_lines = []
        for line in lines:
            if line.strip().startswith('push rtmp://127.0.0.1:19350/rtmp/'):
                updated_lines.append(f'{spaces}push rtmp://127.0.0.1:19350/rtmp/{stream_key};\n')
            else:
                updated_lines.append(line)

        with open(nginx_conf_path, 'w') as file:
            file.writelines(updated_lines)

        subprocess.run(['sudo', 'systemctl', 'restart', 'nginx'], check=True)

        return 'Stream Key successfully updated', 200
    else:
        return 'Unauthorized', 403


if __name__ == "__main__":
    app.run(host='0.0.0.0')
```
## SSL Certificate Generation with Let's Encrypt
### 1. Install Let's Encrypt
```bash
sudo apt install certbot python3-certbot
```
### 2. Generate the Certificate
```bash
sudo certbot certonly --standalone -d <your-server-domain>
```
### 3. Open Crontab
```bash
sudo crontab -e
```
### 4. Add Automatic Renewal
```
0 3 * * * certbot renew --quiet
```
Save the file with `CTRL + S` and exit with `CTRL + X`.
## Link the RTMP Server to OBS
1. In OBS, go to `Settings > Stream`.
2. Set `Service` to "Custom".
3. Set `Server` to `rtmp://<your-server-domain/ip>/live`.
4. Use your selected `SECRET` as the `Stream Key`.
