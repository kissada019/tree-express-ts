export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};
