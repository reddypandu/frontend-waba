const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background py-20 px-4">
    <div className="max-w-3xl mx-auto prose prose-sm dark:prose-invert">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Effective Date: 2026</p>

      <p className="text-foreground/80">
        Patternsmate is a business messaging application that uses the WhatsApp Cloud API provided by Meta to send business communications.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Information We Collect</h2>
      <p className="text-foreground/80">
        We may process phone numbers and message content strictly for business communication purposes. We do not sell, rent, or share user data with third parties.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">How We Use Information</h2>
      <ul className="list-disc pl-6 text-foreground/80 space-y-1">
        <li>To send WhatsApp business messages</li>
        <li>To respond to customer inquiries</li>
        <li>To manage communication campaigns</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Data Protection</h2>
      <p className="text-foreground/80">
        All communication is securely processed through Meta's WhatsApp Cloud API infrastructure. We take reasonable measures to protect user information.
      </p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Contact Us</h2>
      <p className="text-foreground/80">
        If you have any questions regarding this Privacy Policy, please contact us at:<br />
        Email: <a href="mailto:thepatternsmarketing@gmail.com" className="text-primary hover:underline">thepatternsmarketing@gmail.com</a>
      </p>
    </div>
  </div>
);

export default PrivacyPolicy;

