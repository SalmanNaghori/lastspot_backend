// Ambient type declarations for Supabase Edge Functions (Deno runtime)
// This enables TypeScript and editor autocompletion without errors when
// developing Edge Functions in standard VS Code / IDE environments.

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    has(key: string): boolean;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;
}

declare namespace EdgeRuntime {
  export function waitUntil(promise: Promise<unknown>): void;
}

// Allow URL-based imports used by Deno in Supabase Edge Functions
declare module "https://*";
declare module "jsr:*";
