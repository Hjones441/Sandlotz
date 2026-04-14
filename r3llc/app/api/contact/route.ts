import { NextRequest, NextResponse } from 'next/server'

interface ContactPayload {
  firstName: string
  lastName: string
  email: string
  company?: string
  companySize?: string
  service?: string
  challenge: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildEmailHtml(body: ContactPayload): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 8px;">
      <h2 style="color: #09090b; margin-top: 0;">New inquiry — R3 LLC</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px; width: 140px;">Name</td><td style="padding: 8px 0; color: #09090b; font-size: 14px;">${body.firstName} ${body.lastName}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Email</td><td style="padding: 8px 0;"><a href="mailto:${body.email}" style="color: #2563eb;">${body.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Company</td><td style="padding: 8px 0; color: #09090b; font-size: 14px;">${body.company || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Company size</td><td style="padding: 8px 0; color: #09090b; font-size: 14px;">${body.companySize || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #71717a; font-size: 13px;">Service interest</td><td style="padding: 8px 0; color: #09090b; font-size: 14px;">${body.service || '—'}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 16px; background: #fff; border: 1px solid #e4e4e7; border-radius: 6px;">
        <p style="margin: 0 0 6px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Challenge</p>
        <p style="margin: 0; color: #09090b; font-size: 14px; line-height: 1.6;">${body.challenge}</p>
      </div>
      <p style="margin-top: 24px; font-size: 12px; color: #a1a1aa;">Submitted via rthreellc.com contact form</p>
    </div>
  `
}

function buildAutoReplyHtml(firstName: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #09090b; margin-top: 0;">Got your message.</h2>
      <p style="color: #3f3f46; line-height: 1.7;">Hi ${firstName},</p>
      <p style="color: #3f3f46; line-height: 1.7;">Thanks for reaching out to R3 LLC. I've received your message and will review it within one business day.</p>
      <p style="color: #3f3f46; line-height: 1.7;">If you'd like to skip the wait and book a discovery call directly, you can use the link below — 30 minutes, no pressure.</p>
      <p style="margin-top: 28px;">
        <a href="https://calendly.com/rthreellc" style="display: inline-block; background: #2563eb; color: #fff; font-weight: 600; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px;">Book a Discovery Call</a>
      </p>
      <p style="color: #3f3f46; line-height: 1.7; margin-top: 28px;">Talk soon,<br/><strong>Harrison Jones</strong><br/>R3 LLC</p>
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
      <p style="font-size: 12px; color: #a1a1aa;">R3 LLC · rthreellc.com · admin@rthreellc.com</p>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json()
    const { firstName, lastName, email, company, companySize, service, challenge } = body

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!challenge?.trim() || challenge.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please describe your challenge (at least 10 characters)' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.CONTACT_TO_EMAIL || 'admin@rthreellc.com'
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

    if (apiKey) {
      // Send notification to Harrison
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          reply_to: email,
          subject: `New inquiry — ${firstName} ${lastName} (${company || 'No company'})`,
          html: buildEmailHtml(body),
        }),
      })

      // Send auto-reply to the lead
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: email,
          subject: `Got your message — here's what happens next`,
          html: buildAutoReplyHtml(firstName),
        }),
      })
    } else {
      // Dev fallback: log to console
      console.log('\n📬 New contact form submission —', new Date().toISOString())
      console.log({
        name: `${firstName} ${lastName}`,
        email,
        company: company || '—',
        companySize: companySize || '—',
        service: service || '—',
        challenge: challenge.substring(0, 200),
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
