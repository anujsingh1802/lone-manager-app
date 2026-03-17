import twilio from 'twilio';

function normalizePhoneNumber(phone) {
  if (!phone) {
    return '';
  }

  const trimmed = String(phone).trim();
  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return `+${digits}`;
}

function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null;
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export function getSmsConfiguration() {
  return {
    configured: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
    ),
    fromPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  };
}

export async function sendSms({ to, body }) {
  const client = getTwilioClient();
  const config = getSmsConfiguration();

  if (!client) {
    throw new Error('Twilio credentials are missing.');
  }

  if (!config.fromPhoneNumber && !config.messagingServiceSid) {
    throw new Error('Twilio sender is missing. Set TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID.');
  }

  const payload = {
    to: normalizePhoneNumber(to),
    body,
  };

  if (config.messagingServiceSid) {
    payload.messagingServiceSid = config.messagingServiceSid;
  } else {
    payload.from = config.fromPhoneNumber;
  }

  const response = await client.messages.create(payload);

  console.log(`[sms] sent sid=${response.sid} to=${payload.to} status=${response.status}`);

  return {
    sid: response.sid,
    status: response.status,
    to: response.to,
    body: response.body,
  };
}

export async function sendOtpSms(phone, otp) {
  return sendSms({
    to: phone,
    body: `Your Loan Manager verification code is: ${otp}`,
  });
}

export async function sendReminderSms(phone, message) {
  return sendSms({
    to: phone,
    body: message,
  });
}
