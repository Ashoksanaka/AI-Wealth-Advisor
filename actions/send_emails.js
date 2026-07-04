"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  const from =
    process.env.RESEND_FROM_EMAIL || "Wealth App <onboarding@resend.dev>";

  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}