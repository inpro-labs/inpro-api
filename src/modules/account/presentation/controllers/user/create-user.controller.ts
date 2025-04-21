import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '@modules/account/application/commands/user/create-user.command';
import { CreateUserInputDTO } from '@modules/account/application/dtos/user/create-user-input.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  MicroserviceRequest,
  MessageResponse,
  ZodValidationPipe,
} from '@inpro-labs/microservices';
import { UserToResponseAdapter } from '../../adapters/user-to-response.adapter';
import { CreateUserSchema } from '../../schemas/user/create-user.schema';

@Controller()
export class CreateUserController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create_user')
  async createUser(
    @Payload(new ZodValidationPipe(CreateUserSchema))
    payload: MicroserviceRequest<CreateUserInputDTO>,
  ) {
    const user = await this.commandBus.execute(
      new CreateUserCommand(payload.data),
    );

    const adapter = new UserToResponseAdapter();

    return MessageResponse.ok(user.toObject(adapter));
  }
}
