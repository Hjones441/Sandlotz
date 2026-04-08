import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, company, email, website,
      partnerType, goal, budget, referral, notes,
    } = body

    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD
    if (!user || !pass) {
      return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })

    const html = `
      <h2>New Partnership / Investor Inquiry — Sandlotz</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td style="font-weight:bold;color:#555;">Name</td><td>${name ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Company</td><td>${company ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="font-weight:bold;color:#555;">Website / LinkedIn</td><td>${website ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Partnership Type</td><td>${partnerType ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Goal / Use Case</td><td>${goal ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Budget</td><td>${budget ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Referral Source</td><td>${referral ?? '—'}</td></tr>
        <tr><td style="font-weight:bold;color:#555;">Additional Notes</td><td>${notes ?? '—'}</td></tr>
      </table>
    `

    await transporter.sendMail({
      from: `"Sandlotz Partnerships" <${user}>`,
      to: 'Hjones441@gmail.com',
      replyTo: email,
      subject: `New Partnership Inquiry: ${name ?? 'Unknown'} — ${partnerType ?? 'General'}`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[partnership route]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
