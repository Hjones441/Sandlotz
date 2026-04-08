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

    // ─────────────────────────────────────────────────────────────────
    // Wire to your email provider here. Examples:
    //
    // Option A: Resend (recommended)
    //   import { Resend } from 'resend'
    //   const resend = new Resend(process.env.RESEND_API_KEY)
    //   await resend.emails.send({
    //     from: process.env.CONTACT_FROM_EMAIL!,
    //     to: process.env.CONTACT_TO_EMAIL!,
    //     subject: `New inquiry — ${firstName} ${lastName} (${company || 'No company'})`,
    //     html: buildEmailHtml(body),
    //   })
    //
    // Option B: SendGrid / Nodemailer / any SMTP provider
    // ─────────────────────────────────────────────────────────────────

    // Dev/staging fallback: log to console
    console.log('\n📬 New contact form submission —', new Date().toISOString())
    console.log({
      name: `${firstName} ${lastName}`,
      email,
      company: company || '—',
      companySize: companySize || '—',
      service: service || '—',
      challenge: challenge.substring(0, 200),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
