# AirSense Intelligence 🌍

A modern air quality monitoring dashboard with real-time data visualization, AI-powered insights, and smart forecasting capabilities.

![Air Quality Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)

## ✨ Features

- 📊 **Real-time Monitoring** - Track PM2.5, PM10, CO2, and other air quality parameters
- 🗺️ **Interactive Maps** - Visualize air quality data across different locations
- 🤖 **AI Assistant** - Get intelligent insights powered by Google Gemini
- 📈 **Smart Forecasting** - 6-hour and 3-day air quality predictions
- 🚨 **Alert System** - Email/SMS notifications for pollution levels
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/PathanWasim/airsense.git
cd airsense

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5001` to see the application.

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, TailwindCSS, shadcn/ui, Leaflet Maps  
**Backend:** Express.js, PostgreSQL, Drizzle ORM, WebSocket  
**AI:** OpenAI, Google Gemini, Anthropic Claude  

## 📝 Environment Setup

Create a `.env` file with:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/airsense
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run check    # TypeScript type checking
```

## 🏗️ Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types & schemas
└── migrations/      # Database migrations
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ for cleaner air and healthier communities</strong>
</div>