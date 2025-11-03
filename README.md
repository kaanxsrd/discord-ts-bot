<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=300&section=header&text=Vaneta%20Bot&fontSize=90&animation=fadeIn&fontAlignY=38&desc=A%20blazing-fast%20Discord%20bot%20built%20with%20TypeScript,%20Bun%20and%20Drizzle.&descAlignY=55&descAlign=50" alt="Vaneta Bot banner" />
</p>

> **Note**  
> Vaneta is under active development. Expect frequent updates while we stabilise the core feature set and infrastructure.

## Features

- Modular command, context, and event system for Discord.js v14
- Type-safe configuration powered by `@t3-oss/env-core` and Zod
- PostgreSQL database access through Drizzle ORM with automatic migrations at boot
- Bun-first toolchain for fast installs, hot reload, and production builds
- Biome-driven linting/formatting and Husky-managed Git hooks

## Quick Start Guide

Follow these steps for a clean setup on a fresh machine.

### 1. Requirements

- [Bun](https://bun.sh/) 1.1 or newer  
- Node.js 20+ (optional but recommended for tooling)
- A running PostgreSQL instance (local Docker container or hosted service)
- Discord bot token with the proper gateway intents enabled

### 2. Clone and Install

```bash
git clone https://github.com/kaanxsrd/discord-ts-bot.git
cd discord-ts-bot
bun install
```

### 3. Configure Environment

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Update `.env` with the following values:

```
DISCORD_BOT_TOKEN=your_bot_token
DEVELOPER_GUILD_ID=your_dev_guild_id
DEVELOPER_USER_ID=your_discord_id
DATABASE_URL=postgres://user:password@host:5432/database
```

> The bot only supports PostgreSQL. Ensure `DATABASE_URL` points to a reachable database before starting.

### 4. Prepare the Database

Generate SQL migrations (only needed after schema changes):

```bash
bun run db:generate
```

Push the schema to your database:

```bash
bun run db:push
```

Migrations are also executed automatically during application startup, so future schema changes are applied on-the-fly if the migration folder is present.

### 5. Run the Bot

- Development with hot reload:

```bash
bun run dev
```

- Production-style run:

```bash
bun run start
```

The bot initialises the database pool, runs pending migrations, loads commands/contexts/events, and finally logs into Discord using your token.

## Docker Workflow

Prefer containers? A ready-to-go Docker Compose setup is included.

1. Ensure Docker Desktop (or an equivalent runtime) is running.  
2. Copy `.env.example` to `.env` and set the values as described above.  
3. Launch the services:

```bash
docker compose up --build
```

Docker starts two services:

- `db`: PostgreSQL 16 with credentials matching the default `.env` template
- `bot`: the Vaneta bot, which waits for the database health check before starting

Data is persisted under `./var/data` and the Postgres volume declared at the bottom of `docker-compose.yml`.

## Available Scripts

| Command | Description |
| ------- | ----------- |
| `bun run dev` | Run the bot with hot reload for rapid iteration |
| `bun run start` | Start the bot in production mode |
| `bun run typecheck` | Validate TypeScript types without emitting output |
| `bun run lint` | Run Biome checks |
| `bun run format` | Format the codebase via Biome |
| `bun run db:generate` | Generate Drizzle migrations based on schema changes |
| `bun run db:push` | Apply migrations to the configured Postgres database |
| `bun run db:studio` | Launch Drizzle Studio for interactive DB exploration |

## Contributing

We welcome contributions! To get started:

1. Fork the repository and create a topic branch from `main`.  
2. Make your changes, ensuring all lint, type, and format checks pass.  
3. Open a pull request describing the improvements or fixes.

Please include relevant logs, screenshots, or reproduction steps when reporting issues via [GitHub Issues](https://github.com/kaanxsrd/discord-ts-bot/issues).

## License

Distributed under the GPL-3.0 license. See the [LICENSE](./LICENSE) file for more information.
