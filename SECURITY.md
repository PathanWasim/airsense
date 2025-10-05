# Security Guidelines

## 🔒 API Key Security

This project uses several API keys that must be kept secure:

- **Google AI API Key** (for Gemini AI features)
- **Firebase API Key** (for real-time database)
- **OpenAI API Key** (optional, for additional AI features)

### ⚠️ Important Security Measures

1. **Never commit API keys to version control**
   - All API keys are stored in environment variables
   - The `.env` file is included in `.gitignore`
   - Use `.env.example` as a template

2. **Environment Variable Setup**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual API keys
   nano .env
   ```

3. **Production Deployment**
   - Use your hosting platform's environment variable settings
   - Never include real API keys in Docker images
   - Use secrets management for production environments

## 🛡️ Security Features Implemented

### API Key Protection
- ✅ Moved hardcoded API keys to environment variables
- ✅ Added fallback error messages for missing keys
- ✅ Updated `.gitignore` to prevent accidental commits
- ✅ Created `.env.example` for safe sharing

### Code Security
- ✅ Removed exposed Google API keys from source code
- ✅ Implemented proper environment variable usage
- ✅ Added validation for missing configuration

### Database Security
- ✅ Database credentials stored in environment variables
- ✅ No hardcoded connection strings in source code

## 🚨 If You've Exposed API Keys

If you've accidentally committed API keys to version control:

1. **Immediately rotate/regenerate the exposed keys**
   - Google AI Studio: Generate new API key
   - Firebase: Regenerate API keys in project settings

2. **Remove from Git history**
   ```bash
   # Remove sensitive files from Git history
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push to remote (be careful!)
   git push origin --force --all
   ```

3. **Update your environment variables**
   - Update `.env` with new API keys
   - Update production environment variables

## 📋 Security Checklist

Before deploying:

- [ ] All API keys are in environment variables
- [ ] `.env` file is not committed to Git
- [ ] Production environment variables are configured
- [ ] API keys have appropriate restrictions/scopes
- [ ] Database credentials are secure
- [ ] No hardcoded secrets in source code

## 🔍 Regular Security Audits

Run these commands periodically to check for security issues:

```bash
# Check for potential secrets in code
git log --all --full-history -- .env

# Search for potential API keys
grep -r "AIzaSy" . --exclude-dir=node_modules

# Check .gitignore effectiveness
git status --ignored
```

## 📞 Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public GitHub issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## 🔗 Additional Resources

- [Google API Key Security Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Environment Variables Best Practices](https://12factor.net/config)