# Backend Environment Variables for Supabase

## Quick Setup

Copy this file to `.env` and update with your Supabase credentials:

```bash
cp .env.example .env
```

## Required Configuration

### 1. Supabase Database URL

Get this from: **Supabase Dashboard → Project Settings → Database → Connection string**

**Important**: Use **Transaction** mode (not Session mode)

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

Example:
```env
DATABASE_URL="postgresql://postgres.abcxyz123:MyS3cur3P@ssw0rd@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### 2. JWT Secret

Generate a secure random string for production:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Integration Keys (Optional for now)

You can add these later when setting up integrations:

- **Resend API**: Get from [resend.com](https://resend.com)
- **Twilio**: Get from [twilio.com](https://www.twilio.com/console)
- **Gemini API**: Get from [ai.google.dev](https://ai.google.dev)

## Connection Pooling

Supabase provides built-in connection pooling. The URL format with `.pooler.supabase.com` ensures:
- Efficient connection management
- Better performance under load
- Automatic scaling

## Troubleshooting

**Error: "Can't reach database server"**
- Verify you're using the **Transaction** mode connection string (port 5432)
- Check that you replaced placeholders with actual values
- Ensure your Supabase project is active

**Error: "Invalid DATABASE_URL"**
- Make sure the URL is on a single line (no breaks)
- Check for any extra spaces or quotes
- Verify the format matches the example above
