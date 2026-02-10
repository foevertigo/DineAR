# Security Documentation

## Security Practices Implemented

This document outlines the security measures implemented in dineAR following OWASP best practices.

## 1. Authentication & Authorization

### JWT (JSON Web Tokens)
- **Implementation:** JWT-based stateless authentication
- **Token Storage:** Client-side in localStorage
- **Expiration:** 7 days default (configurable via `JWT_EXPIRES_IN`)
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret:** Stored in environment variable `JWT_SECRET`

**Best Practices:**
- ✅ Strong secret key (min 32 characters recommended)
- ✅ Token expiration enforced
- ✅ Signature verification on every request
- ✅ User existence checked on each authenticated request

### Password Security
- **Hashing:** bcrypt with cost factor 12
- **Requirements:** 
  - Minimum 8 characters
  - Must contain at least 1 letter and 1 number
  - Maximum 128 characters (prevents DoS)
- **Storage:** Never stored in plain text
- **Comparison:** Constant-time comparison to prevent timing attacks

**Key Points:**
- ✅ Pre-save hook automatically hashes passwords
- ✅ Password never included in API responses
- ✅ No password hints or recovery via email (out of scope for MVP)

## 2. Rate Limiting

Implemented using `express-rate-limit` to prevent:
- Brute force attacks
- API abuse
- DoS attacks

### Rate Limit Configuration

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| Global | 100 req | 15 min | General API protection |
| Auth (`/auth/*`) | 5 req | 15 min | Prevent brute force |
| Dishes (`/dishes/*`) | 30 req | 15 min | Prevent abuse |

**Response on Rate Limit:**
- HTTP Status: `429 Too Many Requests`
- Headers: 
  - `RateLimit-Limit`
  - `RateLimit-Remaining`
  - `RateLimit-Reset`
- Body: Error message with `retryAfter` timestamp

**Tracking:**
- IP-based for unauthenticated requests
- User ID-based for authenticated requests (where applicable)

## 3. Input Validation & Sanitization

Using `express-validator` for comprehensive input validation.

### Validation Rules

**Email:**
- ✅ Valid email format
- ✅ Max 255 characters
- ✅ Normalized (lowercase, trimmed)
- ✅ HTML escaped

**Password:**
- ✅ Min 8, max 128 characters
- ✅ Must contain letter + number
- ✅ No special characters required (for usability)

**Dish Name:**
- ✅ Min 1, max 100 characters
- ✅ Trimmed whitespace
- ✅ HTML escaped (XSS prevention)
- ✅ Required field

**Plate Size:**
- ✅ Enum validation (small/medium/large only)
- ✅ Rejects unexpected values

**MongoDB ObjectId:**
- ✅ Valid ObjectId format checked
- ✅ Prevents injection attacks

### Mass Assignment Protection
- ✅ `sanitizeFields()` middleware strips unknown fields
- ✅ Only whitelisted fields accepted
- ✅ Prevents malicious field injection

## 4. File Upload Security

Using `multer` with strict security controls.

### Upload Restrictions

**File Type:**
- ✅ MIME type validation
- ✅ Only JPEG, PNG, WebP allowed
- ✅ Extension validation

**File Size:**
- ✅ 5MB maximum
- ✅ Prevents DoS via large uploads

**Storage:**
- ✅ Unique filenames (timestamp + nanoid)
- ✅ Prevents path traversal
- ✅ Stored outside web root

**Cleanup:**
- ✅ Failed uploads deleted automatically
- ✅ Old files deleted when dish is deleted

## 5. API Security Headers

Using `helmet.js` to set security headers:

```javascript
Content-Security-Policy
X-DNS-Prefetch-Control
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection
Strict-Transport-Security (production)
```

**Additional Headers:**
- ✅ `crossOriginResourcePolicy: cross-origin` for image loading

## 6. CORS (Cross-Origin Resource Sharing)

**Configuration:**
- ✅ Whitelist of allowed origins (from `ALLOWED_ORIGINS` env var)
- ✅ Credentials allowed for authenticated requests
- ✅ Rejects requests from unauthorized origins

**Default Allowed Origins:**
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (alternative dev)

**Production:** Update `ALLOWED_ORIGINS` to include production domain

## 7. Database Security

### MongoDB Security

**Mongoose Schema Validation:**
- ✅ Type checking on all fields
- ✅ Required field enforcement
- ✅ Length limits
- ✅ Enum validation

**Indexes:**
- ✅ Indexed fields for performance
- ✅ Compound indexes for common queries
- ✅ Unique constraints (email)

**Query Safety:**
- ✅ Mongoose prevents NoSQL injection by default
- ✅ Input validation before queries
- ✅ No raw query strings from user input

**Connection:**
- ✅ Connection string in environment variable
- ✅ Connection pooling enabled
- ✅ Graceful shutdown handling

## 8. Error Handling

**Production Mode:**
- ✅ No stack traces exposed
- ✅ Generic error messages
- ✅ Detailed errors logged server-side only

**Error Categories:**
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Rate limit errors (429)
- Server errors (500)

**Logging:**
- ✅ Errors logged with context
- ✅ No sensitive data in logs
- ✅ Request path and method included

## 9. Environment Variables

**Required Variables:**
```bash
MONGODB_URI          # MongoDB connection string
JWT_SECRET           # Strong random secret (CHANGE DEFAULT!)
ALLOWED_ORIGINS      # Comma-separated allowed origins
PORT                 # Server port
NODE_ENV             # development / production
```

**Best Practices:**
- ✅ Never commit `.env` to version control
- ✅ Use strong, random secrets
- ✅ Different secrets for dev/staging/production
- ✅ Rotate JWT secrets periodically

## 10. Known Limitations & Future Improvements

### Current Limitations

⚠️ **JWT Token Invalidation:**
- Tokens cannot be invalidated before expiration
- No token blacklist implemented
- *Mitigation:* Short expiration time (7 days)
- *Future:* Implement Redis-based token blacklist

⚠️ **Password Reset:**
- Not implemented in MVP
- *Future:* Add email-based password reset with time-limited tokens

⚠️ **2FA (Two-Factor Authentication):**
- Not implemented
- *Future:* Add TOTP-based 2FA

⚠️ **CSRF Protection:**
- Not implemented (using JWT, not cookies)
- Not needed for current architecture
- *Note:* If switching to cookie-based sessions, add CSRF tokens

### Future Security Enhancements

1. **Rate Limiting:**
   - Implement Redis-based distributed rate limiting
   - User-specific rate limits
   - Exponential backoff on failed attempts

2. **File Upload:**
   - Virus scanning for uploaded files
   - Cloud storage (S3/R2) with signed URLs
   - Image optimization and resizing

3. **Monitoring:**
   - Security event logging
   - Intrusion detection
   - Automated alerting

4. **Authentication:**
   - OAuth2 support (Google, GitHub)
   - Magic link authentication
   - Session management improvements

## Security Checklist

### Deployment Checklist

Before deploying to production:

- [ ] Change default `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Update `ALLOWED_ORIGINS` to production domain
- [ ] Use HTTPS (required for camera access)
- [ ] Set up MongoDB Atlas or secure MongoDB instance
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Review and adjust rate limits
- [ ] Set up monitoring and logging
- [ ] Regular security updates for dependencies
- [ ] Backup strategy for database
- [ ] Incident response plan

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Rotate JWT secrets every 90 days
- [ ] Audit user accounts quarterly
- [ ] Penetration testing annually

## Reporting Security Issues

If you discover a security vulnerability, please email [security contact] instead of using the issue tracker.

**Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work on a fix ASAP.

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
