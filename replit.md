# GoatBot V2 - Facebook Messenger Bot

## Overview
A Facebook Messenger bot using personal account based on GoatBot V2 by NTKhang. This bot automatically responds to messages, handles commands, and provides various features.

## Project Architecture
- **index.js** - Entry point that spawns Goat.js
- **Goat.js** - Main bot initialization and configuration
- **render.js** - Optimized startup script for Render/low memory hosting
- **start.js** - Alternative startup for low memory environments
- **bot/login/** - Login and authentication handling
- **scripts/cmds/** - Command scripts (48 commands loaded)
- **scripts/events/** - Event handling scripts (7 events loaded)
- **database/** - SQLite database for storing user and group data
- **assets/fonts/** - Custom fonts for canvas features (Bangla/English)

## Configuration
- **config.json** - Main bot configuration (prefix, admins, database, etc.)
- **configCommands.json** - Command-specific settings
- **account.txt** - Facebook session cookies (fbstate)

## Key Settings
- **Prefix:** ×
- **Language:** en
- **Database:** SQLite
- **Bot Nick Name:** Nix Bot

## Recent Changes (2025-11-28)
- Fixed canvas errors with proper text fallbacks (text-based output when canvas unavailable)
- Added assets/fonts folder with font configuration for Bangla and English
- Optimized for low memory hosting (250MB-512MB support)
- Created render.js for Render.com deployment with status page
- Created start.js for optimized low-memory startup
- Canvas moved to optionalDependencies
- Added MEMORY_LIMIT_MB environment variable for explicit memory caps
- SQLite3 rebuilt for Node.js 22 compatibility
- Updated package.json scripts for different deployment scenarios

## Running the Bot

### For Render/Web Hosting:
```bash
npm start  # or node render.js
```

### For Low Memory Hosts (250-512MB):
```bash
MEMORY_LIMIT_MB=256 npm start
# or
npm run lowmem
```

### For Development:
```bash
npm run dev
```

## Memory Optimization
The bot uses environment variables to detect container memory limits:
- `MEMORY_LIMIT_MB` - Explicit memory limit in MB
- `RENDER_MEMORY_MB` - Render.com specific memory limit

If not set, defaults to 512MB when host reports >2GB RAM (common in containers).

Memory modes:
- 256MB or less: 128MB heap, ultra-low mode
- 512MB or less: 256MB heap, low memory mode
- 1GB or less: 384MB heap, standard mode
- More than 1GB: 512MB heap, high memory mode

## Canvas Features
Canvas is optional. When unavailable, commands like `rank`, `balance`, and `uptime` display text-based output instead of images.

## Dependencies
Key dependencies include:
- fca-aryan - Facebook Chat API
- express - Web server for status page
- sqlite3 - Database
- moment-timezone - Time handling
- axios - HTTP requests
- canvas (optional) - Image generation

## Fonts
Place .ttf or .otf files in `assets/fonts/` directory:
- Bangla: Noto Sans Bengali, Kalpurush, SolaimanLipi
- English: Roboto, Inter, Open Sans

## Environment Variables
- `MEMORY_LIMIT_MB` - Set container memory limit (default: auto-detect)
- `PORT` - Web server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

## Notes
- Gmail credentials are optional (for email notifications)
- Canvas module is optional (for image features)
- Status page accessible at the deployment URL
- Bot auto-restarts on crash
