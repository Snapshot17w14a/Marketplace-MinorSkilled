interface CookieStore {
  get(name: string): Promise<CookieListItem | undefined>;
  getAll(name?: string): Promise<CookieListItem[]>;
  set(details: {
    name: string;
    value: string;
    expires?: number | Date;
    path?: string;
    domain?: string;
    sameSite?: "strict" | "lax" | "none";
    secure?: boolean;
  }): Promise<void>;
  delete(name: string): Promise<void>;
}

interface CookieListItem {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
}

declare var cookieStore: CookieStore;
