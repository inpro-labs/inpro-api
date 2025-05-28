import { CommandBus } from '@nestjs/cqrs';
import { Controller, Param, Patch } from '@nestjs/common';
import { RevokeSessionCommand } from '@modules/auth/application/commands/session/revoke-session.command';
import { SessionPresenter } from '../../presenters/session.presenter';
import { Principal } from '@shared/security/jwt/decorators/principal.decorator';
import { IPrincipal } from 'src/types/principal';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Sessions')
@Controller('sessions')
export class RevokeSessionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Revoke session' })
  @ApiBearerAuth()
  async handler(@Param('id') id: string, @Principal() principal: IPrincipal) {
    const session = await this.commandBus.execute(
      new RevokeSessionCommand({
        sessionId: id,
        userId: principal.userId,
      }),
    );

    const presenter = new SessionPresenter();

    const sessionViewModel = presenter.presentSession(session);

    return sessionViewModel;
  }
}
