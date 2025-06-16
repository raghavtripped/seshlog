# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/965650dd-ac7a-4ae0-86e7-6b929d2766aa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/965650dd-ac7a-4ae0-86e7-6b929d2766aa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)

## Authentication

This application now uses Supabase for secure authentication via Magic Links. Here's how it works:

### Authentication Flow
1. **Landing Page**: Users see a welcome screen with a "Get Started" button
2. **Login Page**: Users enter their email address to receive a magic link
3. **Magic Link**: Supabase sends a secure link to the user's email
4. **Authentication**: Clicking the link authenticates the user and redirects to the dashboard
5. **Dashboard**: Authenticated users can manage their sessions

### Security Features
- **No passwords required**: Magic links provide secure, passwordless authentication
- **Server-side session management**: Sessions are managed securely by Supabase
- **Automatic session persistence**: Users stay logged in across browser sessions
- **Secure data isolation**: Each user can only access their own session data

### Key Components
- `useAuth`: Custom hook managing authentication state
- `AuthProvider`: Context provider for authentication throughout the app
- `Login`: Dedicated login page for magic link authentication
- `AuthCallback`: Handles the magic link callback and session setup
- `AppDashboard`: Protected dashboard component for authenticated users

### Database Integration
- User sessions are stored in Supabase with proper user isolation
- All CRUD operations are authenticated and user-scoped
- Real-time updates and data synchronization

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/965650dd-ac7a-4ae0-86e7-6b929d2766aa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
