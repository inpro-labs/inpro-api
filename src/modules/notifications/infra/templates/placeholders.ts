import { PlaceholderSensitivity } from '@modules/notifications/domain/enums/placeholder-sensitivity.enum';
import { TemplatePlaceholderDefinition } from '../services/template-manager.service';

export const allowedPlaceholders: TemplatePlaceholderDefinition[] = [
  {
    sensitivity: PlaceholderSensitivity.PUBLIC,
    name: 'user.name',
    description: 'The name of the user',
  },
  {
    sensitivity: PlaceholderSensitivity.PUBLIC,
    name: 'user.email',
    description: 'The email of the user',
  },
  {
    sensitivity: PlaceholderSensitivity.SECURE,
    name: 'user.id',
    description: 'The id of the user',
  },
  {
    sensitivity: PlaceholderSensitivity.SECURE,
    name: 'token',
    description: 'Generic token placeholder',
  },
];

export const pickPlaceholders = (...names: string[]) => {
  return allowedPlaceholders.filter((placeholder) =>
    names.includes(placeholder.name),
  );
};
