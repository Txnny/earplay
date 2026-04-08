# Project Memory

## Core
Dark radio station theme. Primary green #22c55e (142 72% 50%), accent purple (280 65% 60%), bg near-black (240 6% 6%).
Space Grotesk headings, JetBrains Mono code/accents. Brand name: WAVEFORM.
Brutalist blend: sharp borders (border-brutal), monospace accent labels (font-mono-accent), signal-dot, section-label utilities.
Three roles: artist, dj, admin. Roles stored in user_roles table with has_role() security definer.
Lovable Cloud for backend. Auto-confirm email enabled for dev. Stripe enabled for membership billing.
SoundExchange rate $0.0024/spin for royalty estimates.
Subscription status checked in AuthContext via check-subscription, auto-refreshed every 60s.

## Memories
- [Design tokens](mem://design/tokens) — Full color palette, glow utilities, gradient text class, brutalist utilities
- [Database schema](mem://features/schema) — Tables: profiles, tracks, playlists, playlist_tracks, shows, spins, user_roles, station_config
- [Auth flow](mem://features/auth) — Email/password signup with role selection, AuthProvider context, ProtectedRoute wrapper, subscription state
- [Stripe billing](mem://features/stripe) — Free (prod_UIbw31t6BQzJy3) + Premium $9.99/mo (prod_UIbwXxekmyxLO3, price_1TK0iwHRu80c4uuWF8BBkTcB)
- [FREQUENCY concept](mem://features/frequency-concept) — Underground radio concept blended into WAVEFORM: 24hr grid, royalty system, revenue model, azuracast cron
