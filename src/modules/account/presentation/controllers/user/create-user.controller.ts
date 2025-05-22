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
import { createUserSchema } from '../../schemas/user/create-user.schema';
import { UserPresenter } from '../../presenters/user.presenter';

@Controller()
export class CreateUserController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create_user')
  async createUser(
    @Payload(new ZodValidationPipe(createUserSchema))
    payload: MicroserviceRequest<CreateUserInputDTO>,
  ) {
    const user = await this.commandBus.execute(
      new CreateUserCommand(payload.data),
    );

    const presenter = new UserPresenter();

    const userViewModel = presenter.presentUser(user);

    return MessageResponse.ok(userViewModel);
  }
}
