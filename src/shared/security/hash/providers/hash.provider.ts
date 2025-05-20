import { IHashService } from '../interfaces/hash.service.interface';
import { HashService } from '../services/hash.service';

export const HashProvider = {
  provide: IHashService,
  useClass: HashService,
};
