# Inbound Messages - Complete Guide

## 🎯 **The Goal: True Unified Inbox**

When customers reply to your automated emails or SMS messages, those replies should appear in your CareOps inbox so staff can see and respond to them.

---

## ✅ **Good News: SendGrid Integration!**

**CareOps now uses SendGrid** instead of Resend.

Why this is better:
- ✅ SendGrid's **FREE tier supports inbound email**
- ✅ Same 100 emails/day as Resend
- ✅ Customer replies CAN be captured (with setup)
- ✅ No cost difference

**Setup Required:** You need to configure SendGrid Inbound Parse (see `SENDGRID_SETUP.md`)

---

## ✅ **What DOES Work**

### **1. SMS Replies (Twilio)** ✅ WORKS NOW!

SMS replies work immediately with proper webhook configuration:

**Setup:**
1. Configure Twilio webhook (see `WEBHOOK_SETUP.md`)
2. For local testing, use ngrok: `ngrok http 3000`
3. Set Twilio webhook to: `https://YOUR_NGROK_URL.ngrok.io/api/webhooks/twilio`
4. Customer replies to SMS → appears in inbox instantly!

**Test it:**
- Send an SMS from your Twilio number to a customer
- Customer replies
- Reply appears in your inbox with 🟢 green dot (unanswered)

---

### **2. Simulated Customer Replies** (Testing Feature) ✅

For testing during development, I've added a **"Simulate Customer Reply"** button:

**How to use:**
1. Open any conversation in the inbox
2. Click the 🧪 **test tube icon** in the header
3. Type the customer's reply
4. Select channel (Email or SMS)
5. Click "Add Reply"
6. The message appears as an INBOUND message (from customer)

This lets you test the full conversation flow without needing webhook configuration!

---

## 🚀 **Production Solution: SendGrid Inbound Parse**

To receive **real email replies** in production:

### Step 1: Own a Domain
You need to own a domain (e.g., `yourbusiness.com`)

### Step 2: Verify Sender in SendGrid
1. Go to [SendGrid Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Verify your domain OR single sender email
3. Add DNS records if using domain authentication
4. Wait for verification (usually < 1 hour)

### Step 3: Configure Inbound Parse
1. Go to [SendGrid Inbound Parse](https://app.sendgrid.com/settings/parse)
2. Click "Add Host & URL"
3. Set subdomain: `inbound.yourbusiness.com`
4. Set webhook URL: `https://your-api-domain.com/api/webhooks/sendgrid`
5. Add MX record to DNS: `mx.sendgrid.net` (priority 10)

### Step 4: Update Backend ENV
```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=support@yourbusiness.com
```

### Step 5: Test
1. Send email to customer from CareOps
2. Customer replies to `support@yourbusiness.com`
3. Reply appears in inbox ✅

---

## 🧪 **Testing Flow (Development)**

While setting up SendGrid inbound parse:

### **Option 1: Use Test Button** (Easiest)
1. Click 🧪 icon in conversation header
2. Simulate customer reply
3. Test your staff workflow

### **Option 2: Use SMS with ngrok**
1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http 3000`
3. Configure Twilio webhook with ngrok URL
4. Test with real SMS replies

### **Option 3: Manual API Call**
```bash
# Get conversation ID from inbox
CONVERSATION_ID="your-conversation-id"

# Simulate email reply
curl -X POST http://localhost:3000/api/conversations/$CONVERSATION_ID/messages/inbound \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hi, I have a question about my appointment",
    "channel": "EMAIL"
  }'
```

---

## 📊 **How It Works (Technical)**

### **Webhook Processing:**

```typescript
// 1. External service calls webhook
POST /api/webhooks/resend (for email)
POST /api/webhooks/twilio (for SMS)

// 2. Backend extracts sender info
const email = data.from.email;
const phone = data.From;

// 3. Find contact by email/phone
const contact = await prisma.contact.findFirst({
    where: { email: email }
});

// 4. Find or create conversation
let conversation = await prisma.conversation.findFirst({
    where: { contactId: contact.id }
});

// 5. Create INBOUND message
await prisma.message.create({
    data: {
        conversationId: conversation.id,
        content: messageBody,
        channel: 'EMAIL', // or 'SMS'
        direction: 'INBOUND', // From customer
    }
});

// 6. Message appears in inbox ✅
```

---

## 🔔 **Unanswered Indicator**

When a customer replies:
- Conversation shows 🔴 **red dot**
- Appears at top of inbox list
- Dashboard shows "unanswered conversations" alert
- Staff can reply and dot disappears

---

## ⚡ **Quick Start Checklist**

### For Development (Right Now):
- [x] Webhook endpoints created
- [x] Inbound message handler implemented
- [x] Test button added to inbox
- [x] SMS webhook ready (needs Twilio config)
- [ ] Configure Twilio webhook with ngrok (optional)

### For Production:
- [ ] Get custom domain
- [ ] Verify domain in Resend
- [ ] Configure inbound email MX records
- [ ] Set up Resend webhook
- [ ] Configure Twilio webhook with production URL
- [ ] Test end-to-end

---

## 🎉 **Result**

With proper configuration, you'll have:
- ✅ **True 2-way communication** via email and SMS
- ✅ **All messages in one inbox**
- ✅ **Customer replies visible to staff**
- ✅ **Automated messages shown**
- ✅ **Full conversation history**
- ✅ **Real-time updates**

Your unified inbox will be complete! 💬
