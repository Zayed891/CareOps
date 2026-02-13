# Webhook Setup Guide for Inbound Messages

This guide explains how to configure webhooks so your CareOps inbox can receive customer replies via email and SMS.

---

## 📧 **Email Webhooks (Resend)**

Resend can forward inbound emails to your application via webhooks.

### Step 1: Configure Resend Webhook

1. Go to [Resend Dashboard - Webhooks](https://resend.com/webhooks)
2. Click **Add Webhook**
3. Configure:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/resend`
   - **Events**: Select `email.received` (and optionally `email.replied`)
   - **Status**: Active

### Step 2: Set Up Inbound Email Domain (Production Only)

For development with `onboarding@resend.dev`, inbound emails are **not supported**.

For production:
1. Verify a custom domain in Resend
2. Configure MX records for your domain
3. Use your domain email as the `from` address
4. Customers can reply directly to that email
5. Resend will forward replies to your webhook

### Testing During Development

Since inbound emails don't work in development with `onboarding@resend.dev`, you can:
- Test with production domain
- Or manually test by calling the webhook endpoint:

```bash
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.received",
    "data": {
      "from": "customer@example.com",
      "to": "your-business@yourdomain.com",
      "subject": "Question about service",
      "text": "I have a question about your services..."
    }
  }'
```

---

## 📱 **SMS Webhooks (Twilio)**

Twilio can forward inbound SMS messages to your application.

### Step 1: Get Your Twilio Phone Number

1. Go to [Twilio Console - Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Select your active phone number
3. Note the number (e.g., `+1234567890`)

### Step 2: Configure Webhook for Incoming Messages

1. In your phone number settings, scroll to **Messaging Configuration**
2. Under **A MESSAGE COMES IN**:
   - **Webhook URL**: `https://your-domain.com/api/webhooks/twilio`
   - **HTTP Method**: POST
   - **Content Type**: application/x-www-form-urlencoded
3. Click **Save**

### Testing During Development

#### Using ngrok (Recommended for Local Testing)

1. Install ngrok: `npm install -g ngrok`
2. Start your backend: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update Twilio webhook URL to: `https://abc123.ngrok.io/api/webhooks/twilio`
6. Send an SMS to your Twilio number from your phone
7. The message should appear in your inbox!

#### Manual Testing (Without Phone)

```bash
curl -X POST http://localhost:3000/api/webhooks/twilio \
  -d "From=%2B1234567890" \
  -d "To=%2B0987654321" \
  -d "Body=Hi, I have a question" \
  -d "MessageSid=SM1234567890"
```

---

## 🔄 **How It Works**

### Email Reply Flow:
```
Customer replies to email
       ↓
Resend receives reply
       ↓
Resend calls webhook: POST /api/webhooks/resend
       ↓
Backend finds/creates contact
       ↓
Backend finds/creates conversation
       ↓
Backend creates INBOUND message
       ↓
Message appears in staff inbox ✅
```

### SMS Reply Flow:
```
Customer replies via SMS
       ↓
Twilio receives SMS
       ↓
Twilio calls webhook: POST /api/webhooks/twilio
       ↓
Backend finds/creates contact
       ↓
Backend finds/creates conversation
       ↓
Backend creates INBOUND message
       ↓
Message appears in staff inbox ✅
```

---

## 🔐 **Security Notes**

### Webhook Security (Production)

For production, you should verify webhook signatures:

**Resend:**
- Use `Resend-Webhook-Signature` header
- Verify using your webhook secret

**Twilio:**
- Use `X-Twilio-Signature` header
- Verify using Twilio's validation library

Example for Twilio:
```typescript
import twilio from 'twilio';

const validateTwilioRequest = (req: Request): boolean => {
    const signature = req.headers['x-twilio-signature'];
    const url = `https://your-domain.com${req.originalUrl}`;
    return twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature as string,
        url,
        req.body
    );
};
```

---

## ✅ **Verification Checklist**

- [ ] Resend webhook endpoint configured
- [ ] Twilio webhook endpoint configured
- [ ] Test inbound email (production domain required)
- [ ] Test inbound SMS (use ngrok for local testing)
- [ ] Verify messages appear in inbox
- [ ] Verify contact is matched correctly
- [ ] Verify conversation is created/found

---

## 🐛 **Troubleshooting**

### "Messages not appearing in inbox"
- Check backend logs: `npm run dev`
- Verify webhook is hitting your endpoint
- Check if contact exists with that email/phone
- Verify conversation is being created

### "Webhook returns 404"
- Ensure your backend is running
- Verify the webhook URL is correct
- For local testing, use ngrok

### "Contact not found"
- The contact must exist in your database first
- Customer must have booked or submitted a form before replying
- Email/phone must match exactly

---

## 📊 **Monitoring**

All webhook activity is logged. Check your backend terminal for:
```
[Webhook] Resend event received: email.received
[Webhook] Inbound email recorded for contact: John Doe
```

```
[Webhook] Twilio SMS received from: +1234567890
[Webhook] Inbound SMS recorded for contact: Jane Smith
```
