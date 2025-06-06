import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '@modules/account/application/commands/user/create-user.command';
import { UserPresenter } from '../../presenters/user.presenter';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from '../../dtos/user/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class CreateUserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDTO })
  async createUser(@Body() dto: CreateUserDTO) {
    const user = await this.commandBus.execute(new CreateUserCommand(dto));

    const presenter = new UserPresenter();

    const userViewModel = presenter.presentUser(user);

    return userViewModel;
  }
}
