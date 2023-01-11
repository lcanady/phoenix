import { writable } from "svelte/store";

export interface MenuItem {
  name: string;
  path?: string;
  title?: Boolean;
  alt?: Boolean;
  padding?: boolean;
  onClick?: () => void;
}

export const defaultLinks = [];

export const menuToggle = writable(false);
export const username = writable("");
export const password = writable("");
export const token = writable("");
export const loginError = writable("");
export const menuItems = writable<MenuItem[]>(defaultLinks);
export const preview = writable(false);
export const user = writable<any>();
