import PocketBase from 'pocketbase';
import { TypedPocketBase } from '@/types/pocketbase-types';

export const pb = new PocketBase(process.env.POCKETBASE_URL) as TypedPocketBase;