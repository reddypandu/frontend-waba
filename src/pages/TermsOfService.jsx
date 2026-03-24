const TermsOfService = () => (
  <div className="min-h-screen bg-background py-20 px-4">
    <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Effective Date: 2026</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Use of Service</h2>
      <p className="text-foreground/80">
        Patternsmate provides WhatsApp business messaging automation using Meta's WhatsApp Cloud API. Users must ensure they have proper consent before sending messages.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Prohibited Activities</h2>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>Sending spam or unsolicited messages</li>
        <li>Violating WhatsApp Business policies</li>
        <li>Misusing customer data</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Limitation of Liability</h2>
      <p className="text-foreground/80">
        Patternsmate is not responsible for misuse of the platform or policy violations caused by users.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Compliance</h2>
      <p className="text-foreground/80">
        Users must comply with Meta and WhatsApp Business policies at all times.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Contact</h2>
      <p className="text-foreground/80">
        For support or inquiries:<br />
        Email: <a href="mailto:thepatternsmarketing@gmail.com" className="text-primary hover:underline">thepatternsmarketing@gmail.com</a>
      </p>
    </div>
  </div>
);

export default TermsOfService;

