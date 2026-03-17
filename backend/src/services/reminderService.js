import { sendReminderSms } from './smsService.js';

export function buildLoanReminders(loan, snapshot) {
  if (!loan || !snapshot) return [];

  const dueDate = new Date(snapshot.dueDate);
  const now = new Date();
  const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  const reminders = [];

  if (snapshot.remainingBalance <= 0) {
    return reminders;
  }

  if (diffDays >= 0 && diffDays <= 3) {
    reminders.push({
      type: 'upcoming',
      label: 'Upcoming',
      channel: 'whatsapp',
      message: `EMI due on ${dueDate.toLocaleDateString('en-IN')} for loan ${loan._id}`,
      dueDate,
    });
  }

  if (diffDays < 0) {
    reminders.push({
      type: 'overdue',
      label: 'Overdue',
      channel: 'sms',
      message: `Loan ${loan._id} is overdue by ${Math.abs(diffDays)} day(s).`,
      dueDate,
    });
  }

  if (snapshot.remainingBalance > 0) {
    reminders.push({
      type: 'pending',
      label: 'Pending',
      channel: 'sms',
      message: `Pending balance ${snapshot.remainingBalance} remains unpaid.`,
      dueDate,
    });
  }

  return reminders;
}

export async function dispatchReminder(reminder, customer) {
  const targetPhone = customer?.phoneNumber || reminder?.phoneNumber || '';

  if (!targetPhone) {
    throw new Error('Customer phone number is required to send a reminder.');
  }

  const smsResult = await sendReminderSms(targetPhone, reminder.message);

  return {
    provider: 'twilio',
    status: smsResult.status || 'queued',
    channel: reminder.channel || 'sms',
    customer: targetPhone,
    message: reminder.message,
    sid: smsResult.sid,
    createdAt: new Date(),
  };
}
