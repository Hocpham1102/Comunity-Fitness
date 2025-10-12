# 🥕 Fitness Carrot

A comprehensive fitness tracking application built with Next.js, featuring workout tracking, nutrition planning, progress analytics, and expert coaching.

![Fitness Carrot](public/carrot-mascot.png)

## ✨ Features

- **Workout Tracking**: Log exercises, sets, reps, and weight with detailed analytics
- **Nutrition Planning**: Plan meals, track macros, and hit calorie goals
- **Progress Analytics**: Visualize your journey with charts and insights
- **Expert Coaching**: Connect with certified trainers for personalized plans
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Analytics**: Vercel Analytics
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **pnpm** (recommended) or npm/yarn
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd fitness-carrot
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy the example file (if available)
cp .env.example .env.local

# Or create manually
touch .env.local
```

Add any required environment variables to `.env.local`.

### 4. Development Server

Start the development server:

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint to check for code issues |

## 🏗️ Build for Production

### Build the Application

```bash
# Using pnpm
pnpm build

# Using npm
npm run build

# Using yarn
yarn build
```

### Start Production Server

```bash
# Using pnpm
pnpm start

# Using npm
npm start

# Using yarn
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
fitness-carrot/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── nutrition/         # Nutrition tracking pages
│   ├── progress/          # Progress analytics pages
│   ├── workouts/          # Workout tracking pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── layouts/           # Layout components
│   ├── ui/               # shadcn/ui components
│   └── theme-provider.tsx # Theme provider
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── styles/               # Additional styles
└── ...config files
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on top of Radix UI primitives. All components are located in the `components/ui/` directory and can be customized as needed.

## 🌙 Theme Support

The application includes dark/light theme support using `next-themes`. The theme provider is configured in `components/theme-provider.tsx`.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `postcss.config.mjs` - PostCSS configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/fitness-carrot/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the icon library
- [Vercel](https://vercel.com/) for the deployment platform

---

Made with ❤️ by the Fitness Carrot team
