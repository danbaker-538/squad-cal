@AGENTS.md

# PDcAlendar (Squad Cal)

Private social calendar for PDA (Pi Delta Alpha / ΦΔΑ) — built for Spring Quarter 2026 at Stanford.

## Tech Stack
- **Next.js 16** (App Router, Turbopack) — `params`, `searchParams`, `cookies()` are all async/Promises
- **Supabase** (Postgres, RLS) — anon key with permissive RLS; auth handled via cookies in server actions
- **Tailwind CSS v4** — uses `@theme inline` for custom colors, `card-spring` and `gradient-text` custom classes
- **Deployed on Vercel** — auto-deploys on push to `main`. Data lives in Supabase, deploys don't affect it

## Identity Model
- **No accounts** — identity is cookie-based (`squad_member_id`, `squad_group_id`, `squad_known_members`)
- Each member gets a **recovery code** (`PDA-XXXX`) to log back in on any device
- Multi-group support: `squad_known_members` cookie stores JSON array of all member IDs for this browser
- Cookies set in `src/lib/member.ts`, 1-year expiry

## Database Schema (Supabase)
- `groups` — id, name, invite_code (unique 6-char slug)
- `members` — id, group_id, display_name, xp, recovery_code (unique), push_subscription
- `events` — id, group_id, created_by, title, description, location, start_time, end_time
- `rsvps` — id, event_id, member_id, status (going/maybe/not_going), unique(event_id, member_id)
- `xp_log` — id, member_id, event_id, amount, reason (created_event/rsvped/attended)
- `award_xp()` — Postgres function that inserts xp_log and updates members.xp

Schema files: `supabase/schema.sql` (full), `supabase/add-recovery-code.sql` (migration)

## Key Architecture Decisions
- **Server actions** (`src/app/actions.ts`) handle all mutations — group CRUD, event CRUD, RSVP, login
- Actions used with `useActionState` take `(prevState, formData)` signature
- **RSVP uses optimistic UI** (`useOptimistic`) for instant feedback + `revalidatePath()` for server sync
- **Timezone handling**: `datetime-local` inputs are converted to UTC ISO strings on the client before storage. Server-rendered dates use `LocalDate`/`LocalTime` client components (`src/app/components/local-time.tsx`) to display in user's timezone
- Event queries fetch 1 month ago → 3 months ahead for the calendar grid view

## Routes
| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Home — create group or log in with recovery code. `/?new` bypasses auto-redirect |
| `/join/[code]` | Server | Join group via invite code |
| `/g/[groupId]` | Server | Main view — upcoming list + calendar grid toggle |
| `/g/[groupId]/event/new` | Server | Create event form |
| `/g/[groupId]/event/[eventId]` | Server | Event detail with RSVP lists |
| `/g/[groupId]/leaderboard` | Server | XP leaderboard |

## XP System
- +10 XP: create event, +5 XP: first RSVP, +20 XP: attended
- Levels: 1→50XP, 2→150XP, 3→300XP, 4→500XP... (see `src/lib/xp.ts`)

## Theme
Spring-themed: warm cream background (`#FFFBF0`), sunny yellow→pink gradient, coral accent (`#E8457C`), Nunito font. Custom classes: `.card-spring` (white card with lavender border + shadow), `.gradient-text` (animated coral→orange gradient text).

## Deploy Workflow
1. Make changes locally
2. `git add` + `git commit` + `git push` → Vercel auto-deploys
3. Database migrations: run SQL in Supabase SQL Editor before pushing code that depends on schema changes
4. Git email must be `danbaker@stanford.edu` to match Vercel/GitHub
