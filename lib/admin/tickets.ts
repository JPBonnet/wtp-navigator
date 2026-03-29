/**
 * Admin Support Ticketing
 * Create, update status, and comment on support tickets
 */

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  contactEmail: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  comments: TicketComment[];
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  created_at: string;
}

export interface CreateTicketParams {
  subject: string;
  description: string;
  contactEmail: string;
  priority?: 'low' | 'medium' | 'high';
}

const ticketStore: Ticket[] = [];
let ticketCounter = 0;
let commentCounter = 0;

export function resetTicketStore() {
  ticketStore.length = 0;
  ticketCounter = 0;
  commentCounter = 0;
}

export function getTickets(): Ticket[] {
  return [...ticketStore];
}

export async function createTicket(params: CreateTicketParams): Promise<Ticket> {
  ticketCounter++;
  const ticket: Ticket = {
    id: `ticket_${ticketCounter}`,
    subject: params.subject,
    description: params.description,
    contactEmail: params.contactEmail,
    status: 'open',
    priority: params.priority || 'medium',
    comments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  ticketStore.push(ticket);
  return { ...ticket };
}

export async function updateTicketStatus(
  id: string,
  updates: { status?: Ticket['status']; assignedTo?: string }
): Promise<Ticket | null> {
  const ticket = ticketStore.find(t => t.id === id);
  if (!ticket) return null;

  if (updates.status) ticket.status = updates.status;
  if (updates.assignedTo) ticket.assignedTo = updates.assignedTo;
  ticket.updated_at = new Date().toISOString();

  return { ...ticket, comments: [...ticket.comments] };
}

export async function addComment(ticketId: string, authorId: string, body: string): Promise<TicketComment | null> {
  const ticket = ticketStore.find(t => t.id === ticketId);
  if (!ticket) return null;

  commentCounter++;
  const comment: TicketComment = {
    id: `comment_${commentCounter}`,
    ticketId,
    authorId,
    body,
    created_at: new Date().toISOString(),
  };
  ticket.comments.push(comment);
  ticket.updated_at = new Date().toISOString();

  return { ...comment };
}
