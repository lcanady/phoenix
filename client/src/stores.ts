import { env } from "$env/dynamic/public";
import axios from "axios";
import { writable } from "svelte/store";

export interface MenuItem {
  name: string;
  path?: string;
  title?: Boolean;
  alt?: Boolean;
  padding?: boolean;
  onClick?: () => void;
}

export interface IArticle {
  _id?: string;
  slug: string;
  title: string;
  body: string;
  tags?: string[];
  lock?: string;
  shortImg?: string;
  longImg?: string;
  featured?: boolean;
  default?: boolean;
  landing?: boolean;
  category: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy: string;
  shortFile?: File;
  longFile?: File;
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
export const featured = writable([]);
export const errorMsg = writable("");

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("img", file);
  const res = await axios.post(`${env.PUBLIC_BASE_URL}upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return res.data.file;
};