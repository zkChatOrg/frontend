import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms & Privacy Policy | zkChat",
  description: "Terms of Service and Privacy Policy for zkChat, a privacy-first communication software operated by OpenZK LLC.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-2">zkChat – Terms & Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025</p>

          {/* Intro Section */}
          <section className="mb-12 p-6 bg-muted/30 rounded-lg border border-border">
            <p className="text-foreground leading-relaxed mb-4">
              zkChat is privacy-first communication software. We built zkChat to enable private, secure conversations
              without requiring trust in a central operator. Your messages are end-to-end encrypted, meaning we cannot
              read them—not because we choose not to, but because we are technically unable to do so.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not store your messages. We do not have access to your encryption keys. We cannot comply with
              requests for message content because we do not possess it. This architecture is intentional and
              fundamental to how zkChat works.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The legal terms governing your use of zkChat are set forth below. By using zkChat, you agree to these terms.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#terms" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#privacy" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#disclaimer" className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors">
                Disclaimer
              </a>
            </div>
          </section>

          {/* Terms of Service */}
          <section id="terms" className="mb-12 scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Terms of Service</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">About the Service</h3>
                <p className="text-muted-foreground leading-relaxed">
                  zkChat is communication software that enables end-to-end encrypted messaging, file sharing, and
                  related functionality. The Service is operated by OpenZK LLC, a Wyoming limited liability company
                  ("OpenZK," "we," "us," or "our"). zkChat provides software tools and infrastructure that facilitate
                  private communication between users. We do not host, store, curate, or moderate the content of
                  private communications.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Eligibility</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 13 years of age to use zkChat. By using the Service, you represent that you
                  meet this age requirement. If you are under the age of majority in your jurisdiction, you represent
                  that your parent or legal guardian has reviewed and agrees to these Terms on your behalf.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Nature of the Software</h3>
                <p className="text-muted-foreground leading-relaxed">
                  zkChat is provided as a tool for private communication. We make no guarantees regarding the
                  performance, reliability, availability, or suitability of the software for any particular purpose.
                  The software is provided "as is" without warranty of any kind. Cryptographic software is complex,
                  and while we employ industry-standard encryption practices, no software can guarantee absolute security.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">User Responsibilities</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  You are solely responsible for your use of zkChat. This includes:
                </p>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>All content you create, transmit, or share using the Service</li>
                  <li>Maintaining the security of your devices and encryption keys</li>
                  <li>Ensuring your use complies with all applicable laws in your jurisdiction</li>
                  <li>Any consequences arising from your use or misuse of the Service</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  You agree not to use zkChat for any unlawful purpose or in any manner that could damage, disable,
                  or impair the Service. We reserve the right to terminate access to infrastructure services for
                  users who violate these Terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Open Source & Licensing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Portions of zkChat are released under open-source licenses. The source code for these components
                  is available at{" "}
                  <a
                    href="https://github.com/zkChatOrg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    github.com/zkChatOrg
                  </a>
                  . Use of open-source components is governed by their respective license terms. Certain components,
                  infrastructure, and services may be proprietary. OpenZK may offer commercial licenses, API access,
                  or enterprise services under separate agreements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Availability & Jurisdictional Restrictions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Service may be restricted, unavailable, or prohibited in certain jurisdictions. We do not
                  represent that zkChat is appropriate or available for use in all locations. Users who access
                  or use the Service do so on their own initiative and are responsible for compliance with local
                  laws and regulations. If your use of zkChat would violate any applicable law, you are not
                  authorized to use the Service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">No Professional Advice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  zkChat is a communication tool. Nothing transmitted through or provided by the Service constitutes
                  legal, financial, medical, or other professional advice. You should consult appropriate professionals
                  for advice specific to your situation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Limitation of Liability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by applicable law, OpenZK LLC, its officers, directors, employees,
                  and agents shall not be liable for any indirect, incidental, special, consequential, or punitive
                  damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss
                  of data, use, goodwill, or other intangible losses resulting from (a) your use or inability to
                  use the Service; (b) any unauthorized access to or use of our infrastructure; (c) any interruption
                  or cessation of the Service; (d) any content or conduct of any third party using the Service; or
                  (e) any content transmitted using the Service. In no event shall our total liability exceed one
                  hundred U.S. dollars ($100.00).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may stop using zkChat at any time. We may suspend or terminate access to infrastructure
                  services at our discretion, with or without notice, for conduct that we believe violates these
                  Terms or is harmful to other users, us, or third parties. Due to the decentralized nature of the
                  software, termination of infrastructure access does not prevent use of the open-source software
                  components independently.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Governing Law</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming,
                  United States, without regard to its conflict of law provisions. Any disputes arising under these
                  Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in
                  Wyoming, United States.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section id="privacy" className="mb-12 scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Privacy Policy</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Privacy by Design</h3>
                <p className="text-muted-foreground leading-relaxed">
                  zkChat is architected around the principle that we should not have access to your private
                  communications. This is not a policy choice—it is a technical reality. Messages are encrypted
                  on your device before transmission using keys that we never possess. We cannot read your messages,
                  and we cannot provide them to anyone else.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Data Minimization</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We collect and retain as little information as technically necessary to operate the Service.
                  Our infrastructure is designed to minimize data retention and avoid creating records that could
                  be subject to disclosure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">What We Do NOT Collect</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Message content (we cannot decrypt it)</li>
                  <li>Encryption keys</li>
                  <li>Contact lists or address books</li>
                  <li>User accounts or profiles (no registration required)</li>
                  <li>Location data</li>
                  <li>Browsing history</li>
                  <li>Device identifiers for tracking purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">What MAY Be Processed</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  In the course of operating infrastructure services, certain technical metadata may be transiently
                  processed. This may include:
                </p>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>IP addresses (for connection routing; not logged persistently)</li>
                  <li>Timestamps of connections (for rate limiting and abuse prevention)</li>
                  <li>Encrypted message blobs (transiently, for relay purposes only)</li>
                  <li>Aggregate, anonymized usage statistics (e.g., total messages relayed)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  We do not correlate this information to identify individual users or their communications.
                  Technical data is not retained longer than necessary for operational purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">No Sale or Monetization of Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell, rent, or monetize user data. We do not serve advertisements. We do not build
                  profiles for marketing purposes. Privacy is our product, not a feature we trade away.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">International Users</h3>
                <p className="text-muted-foreground leading-relaxed">
                  OpenZK LLC is based in Wyoming, United States. We do not have an establishment in the European
                  Union or other jurisdictions. If you access the Service from outside the United States, you
                  understand that any technical data processed in connection with the Service may be transferred
                  to and processed in the United States. By using the Service, you consent to this transfer.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">User Rights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Because we do not collect personal data or maintain user accounts, traditional data subject
                  rights (access, correction, deletion) have limited applicability. We cannot provide data we
                  do not have. We cannot delete messages we cannot access. If you have questions about any
                  technical data that may have been processed in connection with your use of the Service, you
                  may contact us at{" "}
                  <a
                    href="mailto:privacy@zkchat.org"
                    className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
                  >
                    privacy@zkchat.org
                  </a>
                  .
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Data Retention</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Encrypted message content is not retained after delivery or expiration. Technical metadata
                  necessary for service operation is retained only as long as operationally necessary, typically
                  measured in hours or days, not weeks or months. We do not maintain long-term archives of
                  operational data.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Changes to This Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. Material changes will be posted on this
                  page with an updated revision date. Your continued use of the Service after changes become
                  effective constitutes acceptance of the revised policy.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer" className="mb-12 scroll-mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-2 border-b border-border">Disclaimer</h2>

            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">No Guarantee of Anonymity.</strong> While zkChat is designed
                to protect the content of your communications, we do not guarantee complete anonymity. Metadata,
                network analysis, device compromise, or user error may reveal information about your communications
                or identity. Users with elevated threat models should evaluate whether zkChat meets their specific
                security requirements.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">User Responsibility for Legal Compliance.</strong> You are
                solely responsible for ensuring that your use of zkChat complies with all applicable laws and
                regulations in your jurisdiction. The availability of zkChat does not constitute legal advice
                or a representation that its use is lawful in your location.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Use at Your Own Risk.</strong> The Service is provided
                without warranties of any kind. You use zkChat at your own risk. OpenZK LLC disclaims all
                liability for damages arising from your use of the Service, to the fullest extent permitted
                by applicable law.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Software Limitations.</strong> No software is perfectly
                secure. Cryptographic implementations may contain undiscovered vulnerabilities. We make no
                representation that zkChat is suitable for any particular use case or threat model. Users
                should conduct their own security assessments.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="pt-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              OpenZK LLC
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Wyoming, United States
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Legal inquiries:{" "}
              <a
                href="mailto:legal@zkchat.org"
                className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
              >
                legal@zkchat.org
              </a>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Privacy inquiries:{" "}
              <a
                href="mailto:privacy@zkchat.org"
                className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
              >
                privacy@zkchat.org
              </a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}
