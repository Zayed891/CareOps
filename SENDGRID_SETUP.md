# SendGrid Setup Guide - Complete Email Integration

## 🎯 **Why SendGrid?**

SendGrid's **FREE tier** includes:
- ✅ 100 emails/day (3,000/month) **forever**
- ✅ **Inbound email parsing** (customer replies appear in inbox!)
- ✅ Webhook support for real-time delivery
- ✅ No credit card required
- ✅ Professional email deliverability

---

## 📋 **Quick Start (5 Steps)**

### **Step 1: Create SendGrid Account**

1. Go to [SendGrid Signup](https://signup.sendgrid.com/)
2. Choose **Free Plan** (100 emails/day)
3. Verify your email address
4. Complete the onboarding questionnaire

**No credit card needed!** ✅

---

### **Step 2: Create API Key**

1. Go to [Settings → API Keys](https://app.sendgrid.com/settings/api_keys)
2. Click **"Create API Key"**
3. Name it: `CareOps API Key`
4. Select **"Full Access"** (or at minimum: Mail Send + Inbound Parse)
5. Click **"Create & View"**
6. **⚠️ COPY THE KEY NOW** (you won't see it again!)

**Example API Key format:**
```
SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ.1234567890abcdefghijklmnopqrstuvwxyz
```

---

### **Step 3: Verify a Sender Email**

SendGrid requires you to verify the email address you'll send FROM.

#### **Option A: Single Sender Verification** (Easiest for testing)

1. Go to [Settings → Sender Authentication](https://app.sendgrid.com/settings/sender_auth/senders)
2. Click **"Create New Sender"**
3. Fill in your details:
   - **From Name**: Your Business Name
   - **From Email Address**: your-email@gmail.com (or any email you own)
   - **Reply To**: Same email (customer replies will go here)
   - **Company Address**: Your address
4. Click **"Create"**
5. **Check your email** and click the verification link
6. Wait for verification (usually instant)

**✅ This email can now be used to send emails!**

#### **Option B: Domain Authentication** (For production - custom domain)

If you own a domain (e.g., `yourbusiness.com`):

1. Go to [Settings → Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Click **"Authenticate Your Domain"**
3. Select your DNS host (e.g., GoDaddy, Cloudflare, etc.)
4. Follow instructions to add DNS records (CNAME records)
5. Wait for verification (can take up to 48 hours)

**Benefits:**
- Send from `support@yourbusiness.com`
- Professional branding
- Better deliverability

---

### **Step 4: Update Backend Environment Variables**

Edit `backend/.env`:

```env
# Email Integration (SendGrid)
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
```

**Replace:**
- `SENDGRID_API_KEY` with the key from Step 2
- `SENDGRID_FROM_EMAIL` with the email you verified in Step 3

---

### **Step 5: Test Sending Emails**

1. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Trigger an automation:**
   - Create a new contact in CareOps
   - The welcome email should send automatically
   - Check your email inbox!

3. **Check SendGrid Dashboard:**
   - Go to [Activity Feed](https://app.sendgrid.com/email_activity)
   - See all sent emails and their status

---

## 📨 **Setting Up Inbound Email (Customer Replies)**

This is the **killer feature** - customer replies to your emails will appear in your CareOps inbox!

### **Prerequisites:**
- You need a **custom domain** (e.g., `yourbusiness.com`)
- Access to your domain's DNS settings

### **Step 1: Configure Inbound Parse**

1. Go to [Settings → Inbound Parse](https://app.sendgrid.com/settings/parse)
2. Click **"Add Host & URL"**

### **Step 2: Set Up Subdomain**

**Receiving Domain:** `inbound.yourbusiness.com`  
**Destination URL:** `https://your-api-domain.com/api/webhooks/sendgrid`

Example for production:
```
Receiving Domain: inbound.yourbusiness.com
Destination URL: https://api.careops.com/api/webhooks/sendgrid
```

Example for local testing (with ngrok):
```
Receiving Domain: inbound.yourbusiness.com
Destination URL: https://abc123.ngrok.io/api/webhooks/sendgrid
```

### **Step 3: Add MX Record to DNS**

Add this MX record to your domain's DNS:

| Type | Host | Value | Priority |
|------|------|-------|----------|
| MX | inbound | mx.sendgrid.net | 10 |

**Example for popular DNS providers:**

#### **Cloudflare:**
1. Go to DNS settings
2. Add record:
   - Type: `MX`
   - Name: `inbound`
   - Mail server: `mx.sendgrid.net`
   - Priority: `10`

#### **GoDaddy:**
1. DNS Management → Add Record
2. Type: `MX`
3. Host: `inbound`
4. Points to: `mx.sendgrid.net`
5. Priority: `10`

### **Step 4: Test Inbound Email**

1. Send an email to: `anything@inbound.yourbusiness.com`
2. Check your CareOps inbox
3. The message should appear! 🎉

---

## 🧪 **Testing Locally with ngrok**

Since SendGrid webhooks need a public URL, use ngrok for local testing:

### **Step 1: Install ngrok**
```bash
npm install -g ngrok
# OR download from: https://ngrok.com/download
```

### **Step 2: Start Your Backend**
```bash
cd backend
npm run dev  # Running on port 3000
```

### **Step 3: Start ngrok**
```bash
ngrok http 3000
```

You'll see:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### **Step 4: Configure SendGrid Webhook**

Go to [Inbound Parse](https://app.sendgrid.com/settings/parse) and set:
```
Destination URL: https://abc123.ngrok.io/api/webhooks/sendgrid
```

### **Step 5: Test**

Send an email to `test@inbound.yourbusiness.com` and watch it appear in your inbox!

---

## 🎨 **Customizing Emails**

### **Branding Your Emails**

The `from` name will show as: **"Your Name - Your Business"**

To customize:
1. Edit `backend/src/services/emailService.ts`
2. Modify the `from` field in the `msg` object

### **Setting Reply-To**

Replies automatically go to the workspace owner's email (configured in CareOps).

This is set in `emailService.ts`:
```typescript
replyTo: {
    email: ownerEmail,
    name: ownerName,
}
```

---

## 📊 **Monitoring & Analytics**

### **Email Activity Feed**
- Go to [Activity Feed](https://app.sendgrid.com/email_activity)
- See delivered, bounced, opened emails
- Track click rates (if enabled)

### **Stats & Reports**
- Go to [Stats → Overview](https://app.sendgrid.com/statistics)
- View delivery rates
- Monitor email performance

---

## 🚨 **Troubleshooting**

### **Problem: Emails not sending**

**Check 1: API Key Valid?**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "your-verified@email.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

**Check 2: Sender Verified?**
- Go to [Sender Authentication](https://app.sendgrid.com/settings/sender_auth/senders)
- Ensure status is "Verified" ✅

**Check 3: Backend Logs**
```bash
# Look for these logs:
[EmailService] Email sent via SendGrid to...
# OR
[EmailService] Failed to send email via SendGrid:
```

**Check 4: SendGrid Activity Feed**
- Go to [Activity Feed](https://app.sendgrid.com/email_activity)
- Search for the recipient email
- Check delivery status

---

### **Problem: Inbound emails not appearing in inbox**

**Check 1: MX Record Correct?**
```bash
dig MX inbound.yourbusiness.com
# Should show: mx.sendgrid.net
```

**Check 2: Webhook URL Correct?**
- Go to [Inbound Parse](https://app.sendgrid.com/settings/parse)
- Verify URL is: `https://your-domain.com/api/webhooks/sendgrid`
- For local testing, use ngrok URL

**Check 3: Contact Exists?**
- The sender's email must match a contact in CareOps
- Go to Contacts and verify the email exists

**Check 4: Webhook Logs**
```bash
# Backend logs should show:
[Webhook] SendGrid inbound email received from: customer@example.com
[Webhook] Inbound email recorded for contact: Customer Name
```

**Check 5: Test Webhook Manually**
```bash
curl -X POST http://localhost:3000/api/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "from": "customer@example.com",
    "subject": "Test Reply",
    "text": "This is a test reply"
  }'
```

---

### **Problem: Hitting daily limit (100 emails)**

**Solutions:**
1. **Upgrade to paid plan** ($19.95/month for 50,000 emails)
2. **Use multiple SendGrid accounts** (not recommended)
3. **Batch notifications** (send daily digests instead of individual emails)

**Check current usage:**
- Go to [Dashboard](https://app.sendgrid.com/dashboard)
- See "Emails Sent Today"

---

## 🔒 **Security Best Practices**

### **1. Webhook Security**

Add webhook signature verification (production):

```typescript
// In webhookController.ts
import crypto from 'crypto';

const verifyWebhook = (req: Request): boolean => {
    const signature = req.headers['x-twilio-email-event-webhook-signature'];
    const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];
    
    // Verify signature matches
    // Implementation: https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
    return true;
};
```

### **2. API Key Rotation**

Rotate your API key every 90 days:
1. Create new API key
2. Update `.env`
3. Restart backend
4. Delete old key

### **3. Environment Variables**

**Never commit `.env` to git!**

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

---

## 📈 **Scaling to Production**

### **Free Tier → Paid Plan**

When you outgrow 100 emails/day:

**Essentials Plan: $19.95/month**
- 50,000 emails/month
- No daily limit
- Remove SendGrid branding
- Email validation API

**Pro Plan: $89.95/month**
- 100,000 emails/month
- Dedicated IP address
- Advanced analytics
- Priority support

### **Domain Authentication**

For production, authenticate your domain:
1. Better deliverability (emails won't go to spam)
2. Professional branding
3. Custom from addresses

### **IP Warming**

If sending high volume:
1. Start slow (< 100/day)
2. Gradually increase over 2-4 weeks
3. Monitor bounce rates
4. Build sender reputation

---

## 🎉 **You're All Set!**

Your CareOps app now has:
- ✅ Professional email sending
- ✅ 100 free emails per day
- ✅ Customer replies in your inbox (with inbound parse)
- ✅ Webhook integration for real-time updates
- ✅ Automation engine fully functional

---

## 📚 **Additional Resources**

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Inbound Parse Guide](https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook)
- [API Reference](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Best Practices](https://docs.sendgrid.com/ui/sending-email/deliverability)

---

## 💬 **Need Help?**

Common issues:
1. **"Invalid API Key"** → Regenerate key, ensure full access
2. **"Email not verified"** → Check sender authentication
3. **"Webhooks not working"** → Use ngrok for local testing
4. **"Hitting limits"** → Upgrade plan or batch notifications

Check backend logs for detailed error messages!
