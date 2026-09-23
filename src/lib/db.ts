import 'server-only';
import { resolve } from 'node:path';
import { Store } from './store';

const globalStore = globalThis as typeof globalThis & { questionStore?: Store };
export function getStore() {
  return (globalStore.questionStore ??= new Store(
    resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || 'data/community.sqlite'),
  ));
}
