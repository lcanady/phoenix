import { writable } from "svelte/store";

export interface MenuItem {
  name: string;
  path?: string;
  title?: Boolean;
  alt?: Boolean;
  padding?: boolean;
  onClick?: () => void;
}

export const defaultLinks = [
  { name: "Featured Articles", title: true },
  { name: "Link", path: "#" },
  { name: "Link Two", path: "#" },
  { name: "Link Three", path: "#" },
  {
    name: "Link Four",
    onClick: () => {
      console.log("Clicked");
    },
    alt: true,
  },
  { name: "Staff", title: true },
  { name: "Link Four", path: "#" },
];

export const menuToggle = writable(false);
export const username = writable("");
export const password = writable("");
export const token = writable("");
export const loginError = writable("");
export const menuItems = writable<MenuItem[]>(defaultLinks);
export const preview = writable(false);
