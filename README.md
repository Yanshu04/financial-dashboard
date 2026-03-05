# Financial Dashboard

A modern, feature-rich personal finance management application built with React, TypeScript, and Tailwind CSS. Track expenses, analyze spending patterns, forecast budgets, and get AI-powered financial insights.

## Features

- **CSV Import**: Seamlessly import bank statements (Indian bank formats supported)
- **Transaction Management**: View, edit, filter, and categorize transactions
- **Spending Analytics**: Visualize spending patterns with interactive charts
- **Budget Management**: Set and track budget limits by category
- **Forecasting**: AI-powered spending forecasts using ARIMA models
- **Anomaly Detection**: Get alerts for unusual spending patterns
- **Smart Suggestions**: Personalized financial recommendations
- **Health Score**: Overall financial health metrics and indicators
- **Dark/Light Mode**: Comfortable viewing in any lighting condition
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui with Radix UI
- **Charts**: Recharts for data visualization
- **State Management**: React Query (TanStack)
- **Forms**: React Hook Form with Zod validation
- **CSV Parsing**: Papa Parse

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yanshu04/financial-dashboard.git
   cd financial-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at (https://deluxe-fairy-2162f6.netlify.app/)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── lib/             # Utility functions and helpers
│   ├── financial-engine.ts    # Core finance calculations
│   ├── indian-bank-parser.ts  # Bank statement parsing
│   ├── types.ts               # TypeScript type definitions
│   └── utils.ts               # Helper utilities
├── hooks/           # Custom React hooks
└── main.tsx         # Application entry point
```

## Supported Bank Formats

Currently supports CSV exports from major Indian banks including:
- HDFC Bank
- ICICI Bank
- Axis Bank
- SBI
- And other banks with standard CSV formats

## Development

To contribute to this project:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Performance

The app is optimized for performance with:
- Code splitting and lazy loading
- Efficient state management
- Optimized re-renders
- Progressive image loading

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - see LICENSE file for details

