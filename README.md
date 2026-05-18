# Poizon666 App

A modern Telegram Web Application for ordering products from Poizon, 1688, and Taobao with integrated order management system.

## 🚀 Features

### Frontend
- **Modern UI/UX** - Built with React 19, TypeScript, TailwindCSS v4
- **Multi-language Support** - Russian, English, Chinese
- **Dark/Light Theme** - Auto-detect or manual selection
- **Real-time Calculator** - Calculate prices with commission options
- **Image Upload** - Compress and upload product images
- **Order Tracking** - Track order status in real-time
- **Admin Panel** - Manage orders, settings, and broadcasts

### Backend
- **FastAPI** - High-performance Python API
- **PostgreSQL** - Robust database with Supabase
- **Telegram Integration** - Bot notifications and Web App
- **Supabase Storage** - Image hosting
- **CBR Rate API** - Automatic exchange rate updates

## 📋 Prerequisites

- Node.js >= 18.0.0
- Python >= 3.9
- PostgreSQL database (Supabase recommended)
- Telegram Bot Token

## 🛠️ Installation

### Backend Setup

1. Navigate to the project root:
```bash
cd /workspace
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

5. Run the backend:
```bash
uvicorn api.index:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | Database user | `postgres.xjfrvfxuzijvuszpwfhd` |
| `DB_PASS` | Database password | - |
| `DB_HOST` | Database host | `aws-1-eu-north-1.pooler.supabase.com` |
| `DB_PORT` | Database port | `6543` |
| `DB_NAME` | Database name | `postgres` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | - |
| `MANAGER_CHAT_ID` | Manager's Telegram ID | `709766413` |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_KEY` | Supabase service key | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

## 📁 Project Structure

```
/workspace
├── api/                    # Backend API
│   ├── __init__.py
│   ├── config.py          # Application configuration
│   ├── database.py        # Database connection
│   ├── index.py           # FastAPI app entry point
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── notifier.py        # Telegram notifications
│   └── routers/           # API route handlers
│       ├── orders.py
│       ├── settings.py
│       ├── broadcast.py
│       └── upload.py
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── api.ts             # API client
│   ├── i18n.ts            # Internationalization
│   └── App.tsx            # Main app component
├── public/                 # Static assets
├── .env.example           # Environment template
├── package.json           # Node dependencies
├── requirements.txt       # Python dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── README.md              # This file
```

## 🌐 API Endpoints

### Health & Diagnostics
- `GET /api/health` - Health check
- `GET /api/db-test` - Database connectivity test
- `GET /api/stats` - Get subscriber and user stats

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders?telegram_id={id}` - Get orders by user
- `PATCH /api/orders/{id}/status` - Update order status
- `PATCH /api/orders/{id}` - Update order details
- `DELETE /api/orders/{id}` - Delete order

### Settings
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings

### Broadcast
- `POST /api/broadcast` - Send broadcast message

### Upload
- `POST /api/upload` - Upload image file

## 🎨 Commission Types

| Type | Rate | Description |
|------|------|-------------|
| Insurance | 10% | Full refund if lost during delivery |
| No Insurance | 7% | Cheaper, no compensation for loss |
| Wholesale | 5% | For orders from 8000¥ total |

## 📱 Order Statuses

1. **New** - Order created
2. **Awaiting Payment** - Waiting for payment
3. **Purchased** - Order purchased
4. **At China Warehouse** - Received at warehouse
5. **Sent to RF (Russia)** - Shipped to Russia
6. **Received** - Order delivered

## 🔒 Security Notes

- Never commit `.env` file
- Change default admin password in `Admin.tsx`
- Use HTTPS in production
- Set proper CORS origins for production
- Keep Telegram bot token secure

## 🚢 Deployment

### Vercel (Frontend)
The frontend is configured for Vercel deployment. Connect your repository and deploy.

### Backend Hosting
Options for backend deployment:
- Vercel Serverless Functions
- Railway
- Render
- Heroku
- Your own VPS

## 📝 License

Private - All rights reserved

## 👥 Support

For support, contact @s1pport on Telegram.
