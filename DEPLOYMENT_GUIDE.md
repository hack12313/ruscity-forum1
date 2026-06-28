# 🚀 Гайд по деплою RusCity Life RP Forum на хостинг

## 📋 Варианты деплоя

Есть три основных способа разместить форум:

---

## 🟢 Вариант 1: Vercel + Neon (БЕСПЛАТНО, РЕКОМЕНДУЕТСЯ)

Самый простой вариант. Не требует никаких технических знаний.

### Шаг 1: Создание базы данных Neon

1. Зайди на [neon.tech](https://neon.tech) и создай аккаунт (бесплатно)
2. Нажми **"Create a project"**
3. Выбери регион (лучше EU или US East)
4. Скопируй строку подключения `DATABASE_URL` — она выглядит так:
   ```
   postgresql://user:password@host/dbname?sslmode=require
   ```

### Шаг 2: Публикация кода на GitHub

1. Зайди на [github.com](https://github.com) и создай аккаунт
2. Нажми **"New repository"**, назови его `ruscitylife-forum`
3. Скачай код форума и загрузи через GitHub Desktop или командой:
   ```bash
   git init
   git add .
   git commit -m "Initial forum setup"
   git remote add origin https://github.com/ВАШ_ЛОГИН/ruscitylife-forum.git
   git push -u origin main
   ```

### Шаг 3: Деплой на Vercel

1. Зайди на [vercel.com](https://vercel.com) и войди через GitHub
2. Нажми **"New Project"**
3. Выбери репозиторий `ruscitylife-forum`
4. Нажми **"Deploy"** — Vercel сам определит Next.js

### Шаг 4: Настройка переменных окружения

В Vercel → твой проект → **Settings → Environment Variables** добавь:

| Переменная | Значение |
|-----------|---------|
| `DATABASE_URL` | postgresql://... (из Neon) |

### Шаг 5: Применение схемы базы данных

1. Установи [Node.js](https://nodejs.org) на свой компьютер
2. В папке с проектом выполни:
   ```bash
   # Создай файл .env.local с DATABASE_URL от Neon
   echo "DATABASE_URL=postgresql://..." > .env.local
   
   npm install
   npx drizzle-kit push
   ```
3. База данных создана! При первом открытии форума автоматически добавятся начальные данные.

**✅ Готово!** Форум доступен по адресу `your-project.vercel.app`

---

## 🔵 Вариант 2: Railway (Простой, от $5/месяц)

### Шаг 1

1. Зайди на [railway.app](https://railway.app)
2. Нажми **"New Project"**
3. Выбери **"Deploy from GitHub repo"**

### Шаг 2: Добавь PostgreSQL

1. В проекте нажми **"+"**
2. Выбери **"Database → PostgreSQL"**
3. Скопируй `DATABASE_URL` из вкладки **Variables**

### Шаг 3: Настрой переменные

В разделе **Variables** твоего сервиса добавь:
```
DATABASE_URL=postgresql://... (из Railway PostgreSQL)
NODE_ENV=production
```

### Шаг 4: Применить схему

В Railway есть встроенный терминал. В разделе вашего сервиса → **Terminal**:
```bash
npx drizzle-kit push
```

**✅ Railway автоматически деплоит при каждом push в GitHub!**

---

## 🟡 Вариант 3: VPS сервер (Полный контроль)

Если у тебя уже есть VPS с Ubuntu/Debian.

### Требования:
- VPS с минимум 1GB RAM
- Ubuntu 22.04 или выше
- Домен (опционально)

### Шаг 1: Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Устанавливаем PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Устанавливаем PM2 (менеджер процессов)
sudo npm install -g pm2

# Устанавливаем Nginx
sudo apt install -y nginx
```

### Шаг 2: Настройка PostgreSQL

```bash
sudo -u postgres psql

-- В консоли PostgreSQL:
CREATE DATABASE forum_db;
CREATE USER forum_user WITH PASSWORD 'ВАШ_ПАРОЛЬ';
GRANT ALL PRIVILEGES ON DATABASE forum_db TO forum_user;
\q
```

### Шаг 3: Клонирование и настройка

```bash
# Клонируем проект
git clone https://github.com/ВАШ_ЛОГИН/ruscitylife-forum.git
cd ruscitylife-forum

# Создаём .env файл
cat > .env << EOF
DATABASE_URL=postgresql://forum_user:ВАШ_ПАРОЛЬ@localhost:5432/forum_db
NODE_ENV=production
EOF

# Устанавливаем зависимости
npm install

# Применяем схему БД
npx drizzle-kit push

# Собираем проект
npm run build
```

### Шаг 4: Запуск через PM2

```bash
# Создаём ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ruscitylife-forum',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Запускаем
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Шаг 5: Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/forum
```

Вставь конфиг:
```nginx
server {
    listen 80;
    server_name ВАШ_ДОМЕН.ru www.ВАШ_ДОМЕН.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/forum /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Шаг 6: SSL сертификат (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ВАШ_ДОМЕН.ru -d www.ВАШ_ДОМЕН.ru
```

**✅ Форум работает на вашем домене с HTTPS!**

---

## 🔑 Первый вход в систему

После деплоя на форуме создаётся аккаунт администратора:

| Поле | Значение |
|------|---------|
| **Логин** | `admin` |
| **Пароль** | `Admin123!` |

⚠️ **ОБЯЗАТЕЛЬНО смените пароль после первого входа!**

---

## ⚙️ Управление форумом

### Возможности администратора:
- 👥 `/admin` — панель управления пользователями
- 🔇 Мут пользователей (с указанием причины и длительности)
- 🚫 Бан/разбан аккаунтов
- 🎖️ Смена ролей: Игрок → Хелпер → VIP → Модератор → Администратор
- 📌 Закрепление/открепление тем
- 🔒 Открытие/закрытие тем

### Роли на форуме:
| Роль | Цвет | Возможности |
|------|------|-------------|
| Администратор | 🔴 Красный | Все возможности, смена ролей |
| Модератор | 🔵 Синий | Мут, бан, управление темами |
| Хелпер | 🟢 Зелёный | Помощь игрокам |
| VIP | 🟡 Жёлтый | Особый статус |
| Игрок | ⚪ Серый | Создание тем и ответов |

---

## 🔄 Обновление форума

```bash
cd ruscitylife-forum
git pull origin main
npm install
npm run build
pm2 restart ruscitylife-forum
```

---

## ❓ Частые вопросы

**Q: Как изменить название сервера?**
A: Поищи "RusCity Life RP" в файлах и замени на своё название.

**Q: Форум не открывается после деплоя?**
A: Проверь, что `DATABASE_URL` правильно указан в переменных окружения.

**Q: Как добавить новые разделы форума?**
A: Отредактируй файл `src/lib/seed.ts` и перезапусти.

---

📌 **Все вопросы по настройке задавай в поддержке!**
