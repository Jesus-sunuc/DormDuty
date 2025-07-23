# Firebase Email Configuration Guide

## Fix for "Domain not allowlisted" Error

### 1. Add Authorized Domains in Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `dormduty-4c06a`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:
   - `localhost` (for development)
   - `dormduty-fe29c.firebaseapp.com` (your auth domain)
   - Any custom domains you plan to use

### 2. Alternative: Use Default Firebase Links

Instead of custom continue URLs, use Firebase's default email verification (which we've implemented).
This avoids the unauthorized domain error completely.

## Steps to Prevent Emails from Going to Spam

### 1. Configure Email Templates in Firebase Console

1. Go to Firebase Console → Authentication → Templates
2. Configure the **Email address verification** template:

**Subject Line:**
```
Verify your DormDuty account
```

**Email Body:**
```
Hi %DISPLAY_NAME%,

Welcome to DormDuty! Please verify your email address to complete your account setup.

Click the link below to verify your email:
%LINK%

This link will expire in 1 hour for security reasons.

If you didn't create a DormDuty account, you can safely ignore this email.

Best regards,
The DormDuty Team

--
This email was sent to %EMAIL% because you signed up for DormDuty.
```

### 2. Customize the Sender Information

- **From name**: `DormDuty`
- **Reply-to email**: Use a real email address you own

### 3. Best Practices for Email Deliverability

1. **Use consistent branding**: "DormDuty" in sender name
2. **Clear purpose**: Explain why they're receiving the email
3. **Professional tone**: Avoid spam trigger words
4. **Include context**: Mention the app name and purpose

## Current Implementation

The code now uses Firebase's default email verification without custom URLs to avoid authorization errors.
Configure the templates in Firebase Console for better deliverability.
