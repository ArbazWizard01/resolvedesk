// Pure routing policy. Callers resolve admins within the ticket's workspace.
export function recipients(actorId: string, ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id) && id !== actorId))];
}

export function commentRecipients(input: {
  actorId: string; actorRole: string; customerId: string;
  assignedToId: string | null; adminIds: string[];
}): string[] {
  const { actorId, actorRole, customerId, assignedToId, adminIds } = input;
  // Admins handle customer replies while the ticket has no assigned agent.
  return recipients(actorId, actorRole === 'CUSTOMER'
    ? (assignedToId ? [assignedToId] : adminIds)
    : [customerId, assignedToId]);
}

export function statusRecipients(input: {
  actorId: string; customerId: string; assignedToId: string | null;
  status: string; adminIds: string[];
}): string[] {
  const { actorId, customerId, assignedToId, status, adminIds } = input;
  return recipients(actorId, [customerId, assignedToId,
    ...(['RESOLVED', 'CLOSED'].includes(status) ? adminIds : [])]);
}
