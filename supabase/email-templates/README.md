# Email templates (Supabase → Authentication → Email Templates)

The site signs customers in with a **code**, so each template must show `{{ .Token }}`.
Paste these into the three templates below. Keep the subject short.

## Confirm signup
Subject: `Your 3MIN SCALP confirmation code`
```html
<h2>Confirm your email</h2>
<p>Your code is:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>Enter it on the sign-in page. It expires soon and works once. If you did not create an account, ignore this email.</p>
```

## Reset password
Subject: `Your 3MIN SCALP password reset code`
```html
<h2>Reset your password</h2>
<p>Your code is:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>Enter it on the sign-in page to choose a new password. If you did not ask for this, ignore this email and your password stays the same.</p>
```

## Magic link
Not used any more. You can leave it as is.
