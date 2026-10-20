import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { Store } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "store.json");
const KV_KEY = "phoebe:store";

let memory: Store | null = null;

function readFileStore(): Store | null {
  try {
    if (!existsSync(DATA_PATH)) return null;
    return JSON.parse(readFileSync(DATA_PATH, "utf8")) as Store;
  } catch {
    return null;
  }
}

function writeFileStore(store: Store) {
  try {
    mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    writeFileSync(DATA_PATH, JSON.stringify(store));
  } catch {
    // Preview and serverless filesystems may be read only. Memory still holds the record.
  }
}

async function readKv(): Promise<Store | null> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  try {
    const { kv } = await import("@vercel/kv");
    const value = await kv.get<Store>(KV_KEY);
    return value;
  } catch {
    return null;
  }
}

async function writeKv(store: Store) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return;
  try {
    const { kv } = await import("@vercel/kv");
    await kv.set(KV_KEY, store);
  } catch {
    // KV is optional. The file and memory copies remain the source of truth locally.
  }
}

export async function readStore(): Promise<Store> {
  if (memory) return memory;
  const fromKv = await readKv();
  if (fromKv) {
    memory = fromKv;
    return memory;
  }
  const fromFile = readFileStore();
  if (fromFile) {
    memory = fromFile;
    return memory;
  }
  memory = createSeed();
  writeFileStore(memory);
  await writeKv(memory);
  return memory;
}

export async function writeStore(store: Store): Promise<void> {
  memory = store;
  writeFileStore(store);
  await writeKv(store);
}

export async function updateStore(mutator: (store: Store) => void): Promise<Store> {
  const store = await readStore();
  mutator(store);
  await writeStore(store);
  return store;
}
