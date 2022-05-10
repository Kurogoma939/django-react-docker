# django-react-docker
Django(API) - React環境

Djangoを実務で使う都合から、React * Djangoのローカル環境を作りたいがために
Dockerを使って構築してみました。

# Docker関連ファイルについて
## docker-compose.yml（全体）
```docker-compose.yml
version: '3'

services:
  backend:
    build:
      context: ./backend
    command: gunicorn backend.wsgi --bind 0.0.0.0:8000
    ports:
      - "8000:8000"
    depends_on:
      - mysql

  frontend:
    build:
      context: ./frontend
    volumes:
      - react_build:/react/build

  nginx:
    image: nginx:latest
    ports:
      - 80:8080
    volumes:
      - ./nginx/nginx-setup.conf:/etc/nginx/conf.d/default.conf:ro
      - react_build:/var/www/react
    depends_on:
      - backend
      - frontend

  mysql:
    image: mysql:5.7.22
    restart: always
    environment:
      MYSQL_DATABASE: sample
      MYSQL_USER: dbuser
      MYSQL_PASSWORD: password
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - 33066:3306

volumes:
  react_build:
  db_data:
```

## Backend(Django)
Dockerfile
```Dockerfile
FROM python:3.8
ENV PYTHONUNBUFFERED 1
WORKDIR /backend
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
```
requirements.txt
```requirements.txt
asgiref==3.3.4
coverage==5.5
django==3.0.7
django-cors-headers==3.7.0
djangorestframework==3.10
pytz==2021.1
sqlparse==0.4.1
gunicorn==20.1.0
mysqlclient==2.0.1
```

## Frontend(React)
Dockerfile
```Dockerfile
FROM node:14.18-alpine
WORKDIR /react
COPY . .
RUN npm run build
```

## Nginx
nginx-setup.conf
```nginx-setup.conf
upstream django {
    server backend:8000;
}

server {
  listen 8080;

  location / {
    root /var/www/react;
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://django;
    proxy_set_header Host $http_host;
  }

  location /admin/ {
    proxy_pass http://django;
    proxy_set_header Host $http_host;
  }
}
```

# pythonの仮想環境（pyenv）の入り方
```
※コマンドです
venv\Scripts\activate
```
### 抜け方
```
deactivate
```

# DjangoをAPIとして用いるためのルーティング設定
django-react-docker/backend/backend/urls.py 
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')) // ここでAPI側のルーティングとつなぐ
]
```
django-react-docker/backend/api/urls.py 
```python
from django.urls import path
from .views import TaskList

urlpatterns = [
    path('task/', TaskList.as_view()) // 普通に設定
]
```
`backend/urls.py`のほうで連携をしているので、APIを呼びたいときは`https://ドメイン/api/task`で呼び出せる

# React側の呼び出し
普通にAPIとしてfetchしてデータを受け取ります。
```javascript
import React, { useEffect, useState } from 'react'

function App() {
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        const apiUrl = 'http://127.0.0.1/api/'
        fetch(`${apiUrl}task/`)
            .then(data => data.json())
            .then(res => {
                setTasks(res)
            })
    }, [setTasks])
    return (
        <ul>
            {tasks.map(task => (
                <li key={task.id}>{task.name}</li>
            ))}
        </ul>
    );
}

export default App;
```

#### 参考サイト
https://harad-hakusyo.com/web/docker/%E3%80%90docker%E3%80%91django-react-nginx-mysql-%E7%92%B0%E5%A2%83%E3%82%92%E6%A7%8B%E7%AF%89%E3%81%99%E3%82%8B/
