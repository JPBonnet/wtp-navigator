/**
 * Admin Support Ticketing Tests
 */
import { createTicket, updateTicketStatus, addComment, resetTicketStore, getTickets } from '@/lib/admin/tickets';

beforeEach(() => resetTicketStore());

describe('Support Ticketing', () => {
  test('creates a ticket from contact form', async () => {
    const ticket = await createTicket({
      subject: 'Cannot access assessment',
      description: 'I get a 403 error when trying to view my assessment results.',
      contactEmail: 'jan@example.nl',
      priority: 'high',
    });

    expect(ticket.id).toBe('ticket_1');
    expect(ticket.subject).toBe('Cannot access assessment');
    expect(ticket.status).toBe('open');
    expect(ticket.priority).toBe('high');
    expect(ticket.contactEmail).toBe('jan@example.nl');
    expect(ticket.comments).toHaveLength(0);
  });

  test('updates ticket status and assignment', async () => {
    const ticket = await createTicket({
      subject: 'Billing question',
      description: 'When will my invoice be ready?',
      contactEmail: 'piet@example.nl',
    });

    const updated = await updateTicketStatus(ticket.id, {
      status: 'in_progress',
      assignedTo: 'admin_1',
    });

    expect(updated).not.toBeNull();
    expect(updated!.status).toBe('in_progress');
    expect(updated!.assignedTo).toBe('admin_1');

    // Update nonexistent
    const notFound = await updateTicketStatus('nonexistent', { status: 'closed' });
    expect(notFound).toBeNull();
  });

  test('adds comments to a ticket', async () => {
    const ticket = await createTicket({
      subject: 'Feature request',
      description: 'Can you add PDF export?',
      contactEmail: 'maria@example.nl',
    });

    const comment = await addComment(ticket.id, 'admin_1', 'We will look into this. Thanks for the feedback!');
    expect(comment).not.toBeNull();
    expect(comment!.body).toBe('We will look into this. Thanks for the feedback!');
    expect(comment!.authorId).toBe('admin_1');

    // Verify comment is attached
    const tickets = getTickets();
    const found = tickets.find(t => t.id === ticket.id)!;
    expect(found.comments).toHaveLength(1);

    // Comment on nonexistent ticket
    const notFound = await addComment('nonexistent', 'admin_1', 'test');
    expect(notFound).toBeNull();
  });
});
