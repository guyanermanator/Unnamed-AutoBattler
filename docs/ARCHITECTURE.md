# Unnamed Auto Battler - Architecture

## Overview

This is a browser-based 2D auto-battler game built with TypeScript, featuring a custom game engine and a client-server architecture.

## Tech Stack

- **Frontend:** TypeScript, Vite, HTML5 Canvas
- **Backend:** Node.js, Fastify, Prisma, PostgreSQL
- **Monorepo:** npm workspaces

## Architecture Layers

### Client (`/client`)

#### Engine Layer
- **Rendering:** Canvas-based renderer with pixel-perfect scaling
- **Input:** Keyboard and mouse handling
- **Scenes:** Scene management system
- **ECS:** Lightweight entity-component system
- **Events:** Type-safe event bus for game-wide communication
- **UI:** Windows 98-style UI widgets
- **Assets:** Asset loading and caching
- **Audio:** Music and sound effect management
- **Animation:** Simple sprite animation system
- **Math:** Vector2 and utility functions
- **RNG:** Seeded random number generator for deterministic gameplay
- **Timers:** Timer and interval system
- **Particles:** Simple particle effects
- **Debug:** F1 debug overlay with FPS, memory, etc.

#### Game Layer
- **Units:** Unit stats, behaviors, and AI
- **Combat:** Turn-based combat simulator (isolated from rendering)
- **Abilities:** Skill system with cooldowns and effects
- **Items:** Equipment and consumables
- **Inventory:** Item management
- **Dungeon:** Procedural dungeon generation (Slay the Spire style)
- **Loot:** Loot table system for rewards
- **Traits:** Unit trait/synergy system
- **Save:** LocalStorage save system

### Server (`/server`)

- **API Routes:** RESTful endpoints for auth, profile, runs, leaderboard
- **Middleware:** JWT authentication and rate limiting
- **Database:** Prisma ORM with PostgreSQL
- **Models:** User, Profile, Run, SavedTeam, ChatMessage, LeaderboardEntry

### Shared (`/shared`)

Type definitions shared between client and server:
- Unit, Item, Ability types
- Combat and dungeon types
- API request/response types

## Key Design Decisions

### 1. Fixed Timestep Simulation
The game loop uses a fixed timestep (60 Hz) for simulation and variable timestep for rendering, ensuring consistent physics and gameplay across different frame rates.

### 2. Seeded RNG
All randomness uses a seeded PRNG (Mulberry32) instead of `Math.random()`. This enables:
- Deterministic gameplay
- Replay functionality
- Save/load of RNG state

### 3. Combat Simulator Isolation
The `CombatSimulator` is intentionally isolated from browser APIs and rendering code. It can run headless for:
- Server-side combat simulation
- Unit tests
- Replay generation

### 4. Event-Driven Architecture
All systems communicate via a type-safe event bus, enabling loose coupling and easy extension.

### 5. Windows 98 UI
All game UI is drawn on canvas using Win98-style theming (beveled buttons, gray panels, blue title bars) for a nostalgic aesthetic.

## Data Flow

1. **Game Start:** Load assets, initialize systems, create scenes
2. **Scene Updates:** SceneManager updates active scene
3. **Combat:** CombatSimulator runs fixed-timestep simulation
4. **Events:** Systems emit events via EventBus
5. **Rendering:** Renderer draws scene to canvas with pixel-perfect scaling
6. **Save:** SaveSystem persists state to localStorage
7. **Server Sync:** Periodic sync with backend for profile, leaderboard

## Performance Considerations

- **Asset Caching:** All assets loaded once and cached
- **Object Pooling:** Projectiles and particles use pooling (TODO)
- **Culling:** Only render visible entities (TODO)
- **Web Workers:** Consider moving combat simulation to worker (TODO)

## Security

- **JWT Auth:** All API endpoints require authentication
- **Rate Limiting:** Prevents abuse of API endpoints
- **Input Validation:** All user input validated server-side
- **No Secrets in Client:** All game logic validation happens server-side for competitive modes
