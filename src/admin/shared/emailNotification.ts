import { HttpException } from '@nestjs/common';
import * as sendGridMail from '@sendgrid/mail';
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export function getMessage(details) {
  const body = `
    <div>
      <p>A new user with phone number ${details.phone} just signed up as a food creator.</p>
      <p>Click <a href=${details.profileUrl}>here</a> to see full details on the portal.</p>
    </div>
  `;
  return {
    to: details.recepient,
    from: details.sender,
    subject: details.subject,
    html: body,
  };
}

export async function sendEmail(message) {
  try {
    await sendGridMail.send(message);
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Error sending email');
    if (error.response) {
      console.error(error.response.body);
      throw new HttpException(error.response.body?.errors[0]?.message, error.code);
    }
  }
}
