# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your CareOps application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

## Step 2: Create OAuth 2.0 Credentials

1. In the Google Cloud Console, navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth consent screen if prompted:
   - Add your app name (e.g., "CareOps")
   - Add your email
   - Add authorized domains (for production)
5. Add **Authorized JavaScript origins**:
   - For development: `http://localhost:5173`
   - For production: `https://your-domain.com`
6. Add **Authorized redirect URIs**:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://your-api-domain.com/api/auth/google/callback`
7. Click **Create**
8. Copy your **Client ID** and **Client Secret**

## Step 3: Configure Backend Environment Variables

Edit `/backend/.env` and add your Google OAuth credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

For production, update the callback URL:
```env
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
```

## Step 4: Configure Frontend Environment Variables (Optional)

If you're deploying to production, create a `.env` file in the `/frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

For production:
```env
VITE_API_URL=https://your-api-domain.com
```

## Step 5: Restart Your Backend Server

After configuring the environment variables, restart your backend server:

```bash
cd backend
npm run dev
```

## Step 6: Test Google OAuth

1. Navigate to the login page: `http://localhost:5173/login`
2. Click the "Sign in with Google" button
3. You should be redirected to Google's login page
4. After successful authentication, you'll be redirected back to your app

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in your Google Cloud Console matches exactly with the `GOOGLE_CALLBACK_URL` in your `.env` file
- Check for trailing slashes - they must match exactly

### "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Add your email as a test user in the OAuth consent screen settings

### "oauth_failed" in URL
- Check your backend logs for errors
- Verify your Client ID and Client Secret are correct
- Ensure your backend server is running and accessible

## Production Deployment

When deploying to production:

1. Update your Google OAuth credentials with production URLs
2. Add your production domain to authorized JavaScript origins
3. Add your production API callback URL to authorized redirect URIs
4. Update environment variables in your hosting platform
5. Make sure HTTPS is enabled (required by Google for OAuth)

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your credentials
- Review OAuth scopes to ensure you're only requesting necessary permissions
