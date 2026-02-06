export function readEnv(name: string): string | undefined {
  return process.env[name];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function maskApiKey(key: string): string {
  if (key.length <= 4) {
    return '****';
  }
  return `dt_...${key.slice(-4)}`;
}
