# CopperX Telegram Bot

**CopperX Telegram Bot** is a powerful and user-friendly bot that enables users to manage their CopperX account, perform transactions, and interact with their wallets—all within Telegram. This bot allows users to log in, check balances, send and receive USDC, manage payees, and view transaction history interactively.

## Features

### 🔐 **Authentication**
- Secure login using email OTP verification.
- Session management via Redis.

### 💳 **Wallet Management**
- View all linked wallets.
- Set a default wallet for transactions.
- Check wallet balances.
- Deposit funds seamlessly.

### 💸 **Fund Transfers & Payments**
- Send USDC via wallet address or email.
- Withdraw funds to a linked bank account.
- Batch payments for multiple recipients.
- Transaction history tracking.

### 📋 **KYC & User Management**
- View profile details.
- Check KYC/KYB verification status.

### ⚡ **Real-Time Notifications**
- Get updates for deposits and transaction confirmations.

### 🤖 **Interactive & User-Friendly**
- Inline keyboard for easy navigation.
- Forced replies for seamless user input.
- Natural language support for transactions.

## 📌 Setup Instructions

### **Prerequisites**
- **Node.js** (v16+)
- **Redis** (for session management)
- **CopperX API Key**
- **Telegram Bot Token** (from BotFather)
- **Pusher Credentials** (for real-time notifications)

### **Installation**
#### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/kirtiraj22/CopperX-TG-bot.git
cd CopperX-TG-bot
```

#### **2️⃣ Install Dependencies**
```bash
pnpm install
```

#### **3️⃣ Set Up Environment Variables**
Create a `.env` file in the root directory and add:
```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
API_BASE_URL=https://income-api.copperx.io
COPPERX_API_KEY=your-api-key
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
```

#### **4️⃣ Start Redis (If not running)**
```bash
docker run -d -p 6379:6379 redis
```

#### **5️⃣ Run the Bot**
```bash
pnpm start
```

## 📜 Command List

| Command      | Description                    |
|-------------|--------------------------------|
| `/start`    | Display main menu              |
| `/login`    | Start the login process        |
| `/profile`  | View user profile              |
| `/wallet`   | View linked wallets            |
| `/balances` | Check wallet balances          |
| `/send`     | Send USDC to another user      |
| `/history`  | View transaction history       |
| `/logout`   | Log out from the bot           |

## 🔄 API Endpoints Used
- **Authentication**
  - `/api/auth/email-otp/request` - Request OTP
  - `/api/auth/email-otp/authenticate` - Verify OTP
  - `/api/auth/me` - Fetch user profile
- **Wallets**
  - `/api/wallets` - Fetch wallets
  - `/api/wallets/balances` - Check balances
  - `/api/wallets/default` - Set default wallet
- **Transactions**
  - `/api/transfers/send` - Send USDC
  - `/api/transfers/offramp` - Withdraw to bank
  - `/api/transfers` - View transaction history
- **Payees & Batch Payments**
  - `/api/payees` - Manage payees
  - `/api/transfers/send-batch` - Batch payments
- **KYC**
  - `/api/kycs` - Check KYC status

## 🛠 Tech Stack
- **TypeScript** - Strongly typed JavaScript
- **Telegraf** - Telegram bot framework
- **Redis** - Session management
- **Axios** - API calls
- **Pusher** - Real-time notifications
