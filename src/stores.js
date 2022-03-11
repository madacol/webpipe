import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<HTMLElement|null>} */
export const node = writable(null);