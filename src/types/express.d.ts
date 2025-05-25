import { IPrincipal } from './principal';

declare global {
  namespace Express {
    interface Request {
      user?: IPrincipal;
    }
  }
}
