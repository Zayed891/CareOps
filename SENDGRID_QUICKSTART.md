# 🚀 SendGrid Quick Start - Get Running in 5 Minutes

## ✅ **Migration Complete!**

Your CareOps app now uses **SendGrid** instead of Resend.

---

## **Step 1: Sign Up for SendGrid (2 minutes)**

1. Go to: https://signup.sendgrid.com/
2. Click **"Start for Free"**
3. Fill in your details
4. Verify your email
5. Complete the quick survey

**✅ No credit card needed!**

---

## **Step 2: Get Your API Key (1 minute)**

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click **"Create API Key"**
3. Name: `CareOps`
4. Permission: **Full Access**
5. Click **"Create & View"**
6. **COPY THE KEY** (starts with `SG.`)

Example: `SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789`

---

## **Step 3: Verify Your Email (1 minute)**

1. Go to: https://app.sendgrid.com/settings/sender_auth/senders
2. Click **"Create New Sender"**
3. Fill in:
   - **From Name**: Your Name
   - **From Email**: your-email@gmail.com
   - **Reply To**: Same email
   - **Address**: Any address
4. Click **"Create"**
5. **Check your email** and click verify link

---

## **Step 4: Update Your .env File (30 seconds)**

Edit `backend/.env`:

```env
# Email Integration (SendGrid)
SENDGRID_API_KEY=SG.paste_your_key_here
SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
```

**Delete these old lines:**
```env
RESEND_API_KEY=...  # DELETE
EMAIL_FROM=...      # DELETE
```

---

## **Step 5: Restart Backend (30 seconds)**

```bash
cd backend
npm run dev
```

You should see:
```
🚀 CareOps Backend running on port 3000
```

---

## **🎉 Test It!**

1. Open CareOps: http://localhost:5173
2. Create a new contact
3. Watch the welcome email send! ✅
4. Check SendGrid dashboard: https://app.sendgrid.com/email_activity

---

## **📊 Monitor Your Emails**

- **Activity Feed**: https://app.sendgrid.com/email_activity
- **Stats**: https://app.sendgrid.com/statistics
- **Daily Limit**: 100 emails/day (free tier)

---

## **🔧 Need Inbound Email?**

To receive customer replies in your inbox:
1. Read: `SENDGRID_SETUP.md`
2. Configure Inbound Parse
3. Set up custom domain

**For now:** Use the 🧪 test button in the inbox to simulate replies!

---

## **❓ Troubleshooting**

### Problem: Emails not sending

**Check 1:** API key correct?
```env
SENDGRID_API_KEY=SG....  # Must start with "SG."
```

**Check 2:** Email verified?
- Go to: https://app.sendgrid.com/settings/sender_auth/senders
- Status should be **"Verified"** ✅

**Check 3:** Backend logs
```bash
# Look for:
[EmailService] Email sent via SendGrid to...
```

---

## **📚 Full Documentation**

- **`SENDGRID_SETUP.md`** - Complete setup guide
- **`MIGRATION_TO_SENDGRID.md`** - What changed
- **`INBOUND_MESSAGES_README.md`** - Inbound email guide

---

## **✅ You're Done!**

Your CareOps app now has:
- ✅ 100 free emails/day with SendGrid
- ✅ Professional email delivery
- ✅ Inbound email support (with setup)
- ✅ Real-time webhook integration

**Just add your API key and verified email, and start sending!** 🚀

---

**Questions?** Check the logs or review `SENDGRID_SETUP.md` for detailed troubleshooting.
