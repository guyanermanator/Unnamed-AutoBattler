# Unnamed Auto Battler

A browser-based 2D auto-battler game with roguelike elements, built from scratch with TypeScript.

## Features

- **Custom Game Engine** - Built from the ground up with HTML5 Canvas
- **Tactical Combat** - Auto-battler with strategic unit positioning
- **Roguelike Dungeon** - Procedurally generated dungeons (Slay the Spire style)
- **Unit Collection** - Collect and upgrade unique units
- **Item System** - Equipment and consumables
- **Ability System** - Powerful skills with cooldowns
- **Windows 98 UI** - Nostalgic retro aesthetic
- **Multiplayer** - PvP and leaderboards
- **Progression** - Meta-progression and unlockables

## Tech Stack

- **Frontend:** TypeScript, Vite, HTML5 Canvas
- **Backend:** Node.js, Fastify, Prisma, PostgreSQL
- **Architecture:** Monorepo with npm workspaces

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (for backend)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

This will start:
- Client dev server at http://localhost:5173
- Backend API server at http://localhost:3000

### Building

```bash
# Build all packages
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

### Docker

```bash
# Start with Docker Compose
docker-compose up

# Build and start
docker-compose up --build
```

## Project Structure

```
├── client/          # Frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── engine/  # Game engine systems
│   │   ├── game/    # Game logic
│   │   └── scenes/  # Game scenes
│   └── assets/      # Game assets
├── server/          # Backend (Fastify + Prisma)
│   ├── src/
│   │   └── api/     # API routes
│   └── prisma/      # Database schema
├── shared/          # Shared types
└── docs/            # Documentation
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and architecture
- [Roadmap](docs/ROADMAP.md) - Development roadmap

## Development

### Client Development

```bash
npm run dev:client
```

### Server Development

```bash
# Setup database
cd server
npx prisma migrate dev

# Start dev server
npm run dev:server
```

## Contributing

Contributions welcome! Please read our contributing guidelines first.

## License

MIT

## Acknowledgments

- Inspired by Slay the Spire, Teamfight Tactics, and other auto-battler games
- Windows 98 UI aesthetic
Auto Battler game yet to be named 
