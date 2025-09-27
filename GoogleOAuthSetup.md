# Google OAuth2 Setup Guide for Tupalle

This guide will help you set up Google OAuth2 authentication for your Tupalle application.

## Prerequisites

- Google Cloud Console account
- Access to your application's environment variables

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Tupalle OAuth`
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Tupalle`
     - User support email: Your email
     - Developer contact: Your email
   - Add your domain to authorized domains
   - Save and continue through the steps

4. For OAuth client ID:
   - Application type: `Web application`
   - Name: `Tupalle Web Client`
   - Authorized JavaScript origins: 
     - `http://localhost:18089` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:18089/login/oauth2/code/google` (for development)
     - `https://yourdomain.com/login/oauth2/code/google` (for production)

5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

Add these environment variables to your system or `.env` file:

```bash
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# AWS Configuration (shared for S3 and SES)
AWS_S3_ACCESS_KEY=your_access_key_id_here
AWS_S3_SECRET_KEY=your_secret_access_key_here
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

## Step 5: Update Application Configuration

The application is already configured to use these environment variables. Make sure your `application.properties` has:

```properties
# Google OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:18089/login/oauth2/code/google

# AWS Configuration (shared for S3 and SES)
aws.s3.access-key=${AWS_S3_ACCESS_KEY}
aws.s3.secret-key=${AWS_S3_SECRET_KEY}
aws.ses.access-key=${AWS_S3_ACCESS_KEY}
aws.ses.secret-key=${AWS_S3_SECRET_KEY}
aws.ses.from-email=${AWS_SES_FROM_EMAIL}
```

## AWS SES Setup for Email Services

### Step 1: Create AWS Account and Access Keys

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an AWS account if you don't have one
3. Navigate to IAM (Identity and Access Management)
4. Create a new user with programmatic access
5. Attach the `AmazonSESFullAccess` policy
6. Save the **Access Key ID** and **Secret Access Key**

### Step 2: Verify Email Addresses

1. Go to Amazon SES in the AWS Console
2. Navigate to "Verified identities"
3. Click "Create identity"
4. Choose "Email address"
5. Enter your email address (e.g., `noreply@yourdomain.com`)
6. Check your email and click the verification link
7. Repeat for any additional email addresses you want to use

### Step 3: Request Production Access (Optional)

For production use, you'll need to request production access:

1. In SES Console, go to "Account dashboard"
2. Click "Request production access"
3. Fill out the form with:
   - Use case description
   - Website URL
   - Expected sending volume
   - Bounce/complaint handling process
4. Submit the request (usually approved within 24-48 hours)

### Step 4: Configure Environment Variables

Add these environment variables to your system or `.env` file:

```bash
# AWS Configuration (shared for S3 and SES)
AWS_S3_ACCESS_KEY=your_access_key_id_here
AWS_S3_SECRET_KEY=your_secret_access_key_here
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

### Step 5: Update Application Configuration

The application is already configured to use these environment variables. Make sure your `application.properties` has:

```properties
# AWS Configuration (shared for S3 and SES)
aws.s3.access-key=${AWS_S3_ACCESS_KEY}
aws.s3.secret-key=${AWS_S3_SECRET_KEY}
aws.ses.access-key=${AWS_S3_ACCESS_KEY}
aws.ses.secret-key=${AWS_S3_SECRET_KEY}
aws.ses.from-email=${AWS_SES_FROM_EMAIL}
```

### Step 6: Test Email Functionality

1. Start your application
2. Test the forgot password functionality
3. Check your email for the password reset link
4. Verify email templates are working correctly

## Step 7: Test the Integration

1. Start your application
2. Navigate to `http://localhost:18089/auth/google`
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to your application

## OAuth2 Flow for New Users

1. User clicks "Login with Google"
2. User authorizes the application on Google
3. Google redirects back to `/login/oauth2/code/google`
4. Application creates user with temporary username (`temp_googleId`)
5. User is redirected to username selection page
6. User selects their desired username
7. User is logged in and session is created

## OAuth2 Flow for Existing Users

1. User clicks "Login with Google"
2. User authorizes the application on Google
3. Google redirects back to `/login/oauth2/code/google`
4. Application finds existing user by email
5. User is logged in and session is created

## Production Deployment

When deploying to production:

1. Update the redirect URIs in Google Cloud Console to use your production domain
2. Update the `spring.security.oauth2.client.registration.google.redirect-uri` in your production configuration
3. Ensure your domain is added to authorized domains in the OAuth consent screen

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Check that the redirect URI in Google Console matches your application configuration
   - Ensure there are no trailing slashes or protocol mismatches

2. **"access_denied" error**
   - User denied permission on Google's consent screen
   - Check OAuth consent screen configuration

3. **"invalid_client" error**
   - Check that CLIENT_ID and CLIENT_SECRET are correct
   - Ensure environment variables are properly loaded

4. **"unauthorized_client" error**
   - Check that the OAuth client is configured for the correct application type
   - Verify the redirect URI is authorized

### Debug Steps

1. Check application logs for OAuth2 errors
2. Verify environment variables are loaded correctly
3. Test the OAuth flow in a browser
4. Check Google Cloud Console for any error messages

## Security Considerations

1. **Client Secret**: Never commit the client secret to version control
2. **Redirect URIs**: Only add trusted domains to authorized redirect URIs
3. **HTTPS**: Use HTTPS in production for all OAuth2 flows
4. **State Parameter**: The application automatically handles CSRF protection via Spring Security

## API Endpoints

The following endpoints are available for OAuth2 integration:

- `GET /auth/google` - Initiate Google OAuth login
- `GET /oauth2/success` - OAuth2 success callback
- `GET /oauth2/failure` - OAuth2 failure callback
- `POST /auth/select-username` - Select username for new Google users

## Frontend Integration

For frontend integration, you can:

1. Redirect users to `/auth/google` to initiate OAuth
2. Handle the success/failure callbacks
3. For new users, show a username selection form that calls `/auth/select-username`
4. Store the session cookie for authenticated requests

## Support

If you encounter issues:

1. Check the Google Cloud Console for any error messages
2. Review the application logs
3. Verify all configuration matches this guide
4. Test with a fresh Google account to ensure the flow works end-to-end
