import { IEncryptService } from '../interfaces/encrypt.service.interface';
import { EncryptService } from '../services/encrypt.service';

export const EncryptProvider = {
  provide: IEncryptService,
  useClass: EncryptService,
};
