# SSO Simulation

In production, customers arrive at the Digital Wealth Advisor **pre-authenticated** from the YourBank mobile app. No separate login screen is shown.

## Hackathon simulation

### Flow
1. User signs in via Clerk in the web demo (simulates bank identity)
2. `GET /api/v1/auth/bank-sso?bankUserId=demo-user` validates session mapping
3. Embed route `/embed` hides global chrome to simulate in-app micro-widget

### Production flow (documented)
```
Bank App → Bank IdP (SSO) → Token exchange → Wealth API session → Embedded WebView
```

### Test
```bash
curl -b "your-clerk-session-cookie" \
  "http://localhost:3000/api/v1/auth/bank-sso?bankUserId=sarah-demo"
```

### Response
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "bankUserId": "sarah-demo",
    "message": "SSO simulation: In production, the host bank app passes a pre-authenticated token."
  }
}
```

## Embed in bank app

```html
<iframe src="https://wealth.yourbank.com/embed" style="width:100%;height:100%;border:none" />
```

The `/embed` route uses `embed-mode` CSS to hide header/footer, presenting a native micro-app experience.
