import { Writable, writable } from 'svelte/store';

/** @type {Writable<HTMLElement>} */ export const hoveringNode = writable(null);
/** @type {Writable<HTMLElement>} */ export const selectorExplorerNode = writable(null);