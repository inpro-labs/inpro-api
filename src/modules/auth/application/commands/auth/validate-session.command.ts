import { ICommand } from '@nestjs/cqrs';

export class ValidateSessionCommand implements ICommand {
  constructor(public readonly accessToken: string) {}
}
