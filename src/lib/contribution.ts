import type { RoleContribution } from '../types';

export function contributionKey(contribution: RoleContribution) {
  return `${contribution.role}:${contribution.title}`;
}
