# GoatBot V2 - Facebook Messenger Bot

## Overview
A Facebook Messenger bot using personal account based on GoatBot V2 by NTKhang. This bot automatically responds to messages, handles commands, and provides various features.

## Project Architecture
- **index.js** - Entry point that spawns Goat.js
- **Goat.js** - Main bot initialization and configuration
- **bot/login/** - Login and authentication handling
- **scripts/cmds/** - Command scripts
- **scripts/events/** - Event handling scripts
- **database/** - SQLite database for storing user and group data

## Configuration
- **config.json** - Main bot configuration (prefix, admins, database, etc.)
- **configCommands.json** - Command-specific settings
- **account.txt** - Facebook session cookies (fbstate)

## Key Settings
- **Prefix:** ×
- **Language:** en
- **Database:** SQLite
- **Bot Nick Name:** Nix Bot

## Recent Changes (2025-11-29)
- Cleaned up project structure
- Fixed console errors
- Removed unused files (render.js, start.js, server.js, fonts folder, utils folder)
- Simplified package.json scripts
- Bot runs using index.js which spawns Goat.js

## Running the Bot

### Standard Run:
```bash
npm start  # or node index.js
```

### For Development:
```bash
npm run dev
```

## Dependencies
Key dependencies include:
- fca-aryan - Facebook Chat API
- express - Web server
- sqlite3 - Database
- moment-timezone - Time handling
- axios - HTTP requests

## Environment Variables
- `NODE_ENV` - Environment mode (development/production)

## Notes
- Gmail credentials are optional (for email notifications)
- Bot auto-restarts on crash
