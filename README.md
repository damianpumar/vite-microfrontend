# Vite Microfrontend Plugin with Automatic Module Federation Management

Effortlessly manage module federation dependencies in your microfrontend projects with this Vite plugin.

## Installation

Install the plugin as a development dependency:

```sh
pnpm i vite-microfrontend -D
```

## Usage

### Configuration

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from "vite-microfrontend";
import react from "@vitejs/plugin-react";

export default defineConfig({
  federation: {
    name: "store", // Your package name
    exposes: {
      "./store": "./src/store", // The component to expose as a microfrontend
    },
  },
  plugins: [react()],
});
```

### Environment Variables

Specify the locations of your microfrontend packages in a `.env` file:

```
VITE_HOST=http://localhost:3000
VITE_STORE=http://localhost:3001
```

> **Note:**
>
> - Use uppercase letters for the `.env` variables.
> - The variable names (e.g., `VITE_STORE`) should match the folder names of the respective packages.

### Host Project Configuration

For the host project, exclude the `exposes` configuration:

```ts
import { defineConfig } from "vite-microfrontend";
import react from "@vitejs/plugin-react";

export default defineConfig({
  federation: {
    name: "host",
  },
  plugins: [react()],
});
```
