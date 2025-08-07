# Sesh Log

## Overview

**Sesh Log** is a modern, privacy-focused tracker for life routines (sleep, mood, hydration, physical activity) and legacy substance sessions (weed, cigarettes, vapes, liquor). The app is now lean by design with a simplified UI/UX.

---

## Features

### ✨ Tracking
- **Legacy**: Weed, Cigarettes, Vapes, Liquor.
- **Life**: Sleep, Mood, Hydration, Physical Activity.

### 📊 Analytics & Insights
- Quick stats and insights for the features above.

### 📝 Session Details
- Add notes, ratings, and participant count to each session.
- Edit or delete any session with a user-friendly interface.
- All quantities are unit-aware and normalized for accurate stats.

### 🔒 Privacy & Security
- **Supabase Auth**: Secure email/password authentication.
- **Data Isolation**: Each user can only access their own data.
- **Session Persistence**: Stay logged in across browser sessions.
- **RLS Policies**: Database row-level security ensures privacy.

### 🌗 Modern UI/UX
- **Responsive Design**: Works beautifully on mobile and desktop.
- **Dark/Light/System Theme**: Toggle between themes instantly.
- **Accessible**: Built with accessibility in mind.
- **Shadcn-UI & Tailwind CSS**: Clean, modern, and customizable.

---

## How It Works

1. **Landing Page**: Welcome screen with app branding and a "Get Started" button.
2. **Authentication**: Sign up or log in with email/password. (Email verification supported.)
3. **Category Selection**: Choose what you want to track: Weed, Cigarettes, Vapes, or Liquor.
4. **Dashboard**: For each category, log new sessions, view stats, and explore insights.
5. **Session Management**: Edit, delete, and filter your sessions. All changes are instantly reflected in your analytics.
6. **Analytics**: Visualize your habits with charts, key metrics, and period-based insights.

---

## Technologies Used

- **Vite** (build tool)
- **TypeScript**
- **React**
- **shadcn-ui** (component library)
- **Tailwind CSS**
- **Supabase** (authentication & database)
- **React Query** (data fetching/caching)
- **date-fns** (date utilities)
- **Recharts** (data visualization)

---

## Development

### Getting Started

1. **Clone the repository:**
   ```sh
   git clone <YOUR_GIT_URL>
   cd session-scribe-log
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```
4. **Open in your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or as shown in your terminal)

---

## Deployment

- Deploy on Vercel, Netlify, or your preferred platform.
- Configure your Supabase credentials in the environment as needed.

---

## Database & Security

- **Supabase** is used for authentication and as a Postgres database.
- **Row Level Security (RLS)** is enabled for all tables.
- All CRUD operations are authenticated and scoped to the current user.
- See `/supabase/migrations/` for schema and policy details.

---

## Contributing

Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

**Note**: This project is actively maintained and regularly updated with new features and improvements.

---

## License

MIT

---

## App Structure (2025 Refactor)

- `src/app/providers/AppProviders.tsx`: Central providers (React Query, Theme, Auth, Tooltips, Toasters)
- `src/app/layouts/RootLayout.tsx`: App shell with `TopNavbar`, `BottomNavbar`, and `Outlet`
- `src/app/router.tsx`: Router with lazy-loaded routes and `ProtectedRoute`
- `src/features/daily/*/components/*Form.tsx`: Daily tracker forms (sleep, mood, hydration, activity)
- `src/pages/*`: Pages remain; imports updated to use feature forms

Notes:
- Font import moved to `src/main.tsx` (`@fontsource/inter`) to avoid CSS import ordering issues
- `index.css` reorganized; Tailwind layers are loaded after the font import via TS entry
- `TopNavbar` and `BottomNavbar` provide a consistent shell; bottom nav shows on mobile only

## UX Cleanup Highlights

- Unified spacing, shadows, and rounded radii across pages
- Fixed dynamic Tailwind class in `AppDashboard` to avoid invalid class generation
- Improved bottom nav active state with a subtle indicator dot
- Leaned the app: removed Nutrition, Work Focus, Pain, and Supplements features and routes

