# Screenshot Exact Match

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f3f7898-f6c1-489a-bf37-88ea71a133d0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

This project uses npm. Commit `package-lock.json` and use `npm ci` for CI and
repeatable production installs.

## Backend

The independent Go API lives in [`backend/`](backend/README.md). Its OpenAPI
contract, SQL migrations, provider clients and local setup are documented
there. Lovable can continue editing the frontend without restructuring it.

Database migrations are canonical under [`supabase/migrations`](supabase/migrations).
Use `npm run db:start` and `npm run db:reset` to verify them against local
Supabase before pushing them to the hosted project.
