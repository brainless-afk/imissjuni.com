As an excercise I refactored thius repo using typescript, upgrading Nextjs and using app router.  
Also added support for twitch.tv livestream status.

## I MISS JUNI

I miss \<streamer\> web app.

### How to add images

1. Put a .png or .jpg file in public/imagesets/[name]

### Getting Started

#### Prerequisites

- Node.js
- npm or yarn

#### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/imissjuni.com.git
cd imissjuni.com
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

The web app is configured using environment variables,
Set the environmen variables in your .env file, or the actual environment of your server process:

```yaml
# Set the host url of the app
NEXT_PUBLIC_HOST=http://localhost:3000/

# Set the twitch channel to check for livestream status.
WATCH_TWITCH_USER_ID=598403800

# Set the youtube channel to get reps videos. Copy only the part after /channel/ in the URL.
# Only checks for livestream status if twitch handle is not set.
WATCH_YT_CHANNEL_ID=UCbidRNE8aZswWxTTEYuVKgA

# Set app access token used to access twitch API.
# See https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow
# Note: expires after about 50 days so you need to generate a new token
TWITCH_ACCESS_TOKEN=abc123

# Set app’s registered client ID.
# See https://dev.twitch.tv/docs/authentication/register-app/
TWITCH_CLIENT_ID=abc123

# Used for refreshing members/premiere info and updating vod list. Can be created for free at
# https://console.cloud.google.com/apis/api/youtube.googleapis.com/credentials (Google account required)
YOUTUBE_API_KEY=Abc123

# Set token to secure (cron job) api route to update vods in database
CRON_SECRET="abc123"

# If using Postgres:
DATABASE_TYPE=postgres
POSTGRES_URL=postgres://default:abc123

# If using SQLite (for local development):
DATABASE_TYPE=sqlite3
SQLITE_DB_PATH=./data.db

# Optional: Set this to use holodex instead of youtube to check for livestream status.
HOLODEX_API_KEY=""

```

4. Initializing the database

Run either init_postgres.sql or init_sqlite3.sql on your database to create the necessary tables.
