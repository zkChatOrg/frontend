export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "your-ai-conversations-are-not-private",
    title: "Your AI Conversations Are Not Private — Here's What ChatGPT, Gemini, and Claude Actually Store",
    date: "2026-01-28",
    description:
      "Hundreds of millions of people paste passwords, medical details, and legal documents into AI chatbots every day. Here's what actually happens to that data — and what you should do instead.",
    tags: ["Privacy", "AI", "Security"],
    content: `## The Privacy Illusion

Every day, hundreds of millions of people type their most sensitive information into AI chatbots: passwords, medical symptoms, legal questions, financial details, relationship problems, business secrets, and personal confessions. The conversational interface feels private — like talking to a trusted advisor in a closed room.

It's not. That room has recording equipment, an audience of engineers, and a data retention policy measured in months or years.

In January 2026, it's worth examining exactly what the three largest AI platforms — ChatGPT (OpenAI), Gemini (Google), and Claude (Anthropic) — actually do with your conversations.

## What ChatGPT Stores

**Retention:** ChatGPT retains your full conversation history indefinitely for free and Plus users unless you manually delete conversations. After deletion, data is purged within 30 days — unless a legal hold applies.

**Training:** By default, your conversations may be used to train future models unless you disable the "Improve the model for everyone" toggle in settings. Disabling this does not delete previously collected data.

**Human review:** OpenAI employees and contractors may review your conversations for safety, quality, and compliance purposes.

**Temporary chats:** A "temporary chat" mode exists that isn't saved to history and isn't used for training — but data is still retained for up to 30 days "for safety purposes."

**The NYT lawsuit revelation:** In May 2025, a federal court ordered OpenAI to preserve all ChatGPT user conversations indefinitely — including ones users had explicitly deleted. This exposed a fundamental truth: even "deleted" data may persist when legal obligations arise. OpenAI says it has since returned to standard 30-day deletion, but the precedent is set.

**Enterprise:** Business and Enterprise users get stronger protections — no training by default, data isolation, and SOC 2 compliance. But consumer users get none of these guarantees.

## What Google Gemini Stores

**Retention:** When conversation history is enabled (the default), Gemini retains conversations for 18 months by default. When history is off, conversations are still stored for 72 hours.

**Training:** Free users' conversations are used to improve Google AI models by default. Paid subscribers are typically excluded unless they opt in.

**Human review:** Google employees review conversations and associated data. Reviewed data is retained for up to 3 years, disconnected from your account — but still stored.

**Personalization (2025):** Google introduced a feature where Gemini learns from your past conversations to personalize future responses. This is enabled by default. Your conversation patterns, preferences, and details are actively analyzed and retained.

**The Gmail controversy (Jan 2026):** A class-action lawsuit alleges that Google automatically opted users into allowing Gmail to access private messages and attachments to train AI models. Google denies this, but the lawsuit exposes the tension between AI training needs and user privacy.

**Regional disparity:** Users in the EU, UK, and Japan get these features disabled by default. American users don't — creating a two-tiered privacy system where US users receive less protection.

## What Claude (Anthropic) Stores

**Retention:** Default data retention is 30 days for most users. However, since August 2025, users who opt into data sharing for model improvement face a 5-year retention period.

**Training:** Anthropic previously differentiated itself by not using consumer conversations for training. In August 2025, they reversed this stance, giving users the choice to share data for model improvement. This is opt-in, but the shift signals the industry direction: every AI company eventually needs your data.

**The 5-year window:** If you opt in, your conversations are retained in de-identified form for up to 5 years in training pipelines. That's five years of your prompts, questions, and pasted content existing in Anthropic's systems.

**API users:** API retention dropped to 7 days as of September 2025. Enterprise customers can negotiate Zero-Data-Retention (ZDR) agreements.

## The Real Problem: What People Actually Share

The data retention policies matter because of what people actually type into AI chatbots:

**Passwords and credentials.** "Help me generate a secure password" followed by "also, my current password is..."

**Medical information.** "I've been experiencing these symptoms..." — followed by detailed personal health data that becomes part of a training dataset.

**Legal matters.** "I'm being sued for..." or "My employer did this..." — privileged information entered into a system reviewed by human moderators.

**Financial details.** "Here's my financial situation..." including account numbers, income, and investment details.

**Business secrets.** "Review this contract" with full proprietary terms attached. "Here's our product roadmap" with unreleased plans.

**Personal confessions.** The conversational interface encourages sharing. People tell AI chatbots things they wouldn't tell their closest friends — and that data is stored, reviewed, and potentially used for training.

A 2025 Stanford HAI study found that users routinely overshare sensitive information with AI chatbots, often not realizing this data is stored and may be reviewed by humans.

## Why This Matters

**Data breaches happen.** Every company gets breached eventually. OpenAI, Google, and Anthropic are high-value targets. When (not if) they are breached, your conversations could be exposed.

**Legal discovery applies.** As the NYT lawsuit showed, courts can order AI companies to preserve and produce user data. Your conversations with an AI chatbot could be subpoenaed.

**Policies change.** Anthropic went from "we don't train on your data" to "opt-in 5-year retention" in a single policy update. Today's privacy promise is tomorrow's deprecated feature.

**Human review is real.** Your conversations may be read by employees and contractors for safety review, quality assurance, or compliance. The "private" feeling of a chatbot conversation is an illusion.

**De-identification is imperfect.** "De-identified" data can often be re-identified, especially when conversations contain unique personal details — which they almost always do.

## What You Should Do Instead

The solution isn't to stop using AI tools — they're genuinely useful. The solution is to be intentional about what you share.

**Never paste passwords or credentials into any AI chatbot.** Instead, use a self-destructing one-time message. Send the password via an encrypted link that auto-deletes after one view (like zkChat's OTM feature at zkchat.org/otm), then reference it in your AI conversation without including the actual credential.

**Don't share raw legal documents.** If you need AI help with a legal matter, anonymize the details first. Replace real names, companies, and dates with placeholders.

**Be careful with medical information.** Use general descriptions instead of specific personal details. "What are treatment options for condition X?" is safer than sharing your full medical history.

**Use temporary/incognito modes.** Both ChatGPT and Gemini offer modes that reduce (but don't eliminate) data retention. Use them for sensitive queries.

**Disable training toggles.** In all three platforms, disable the setting that allows your data to be used for model training. This won't prevent storage, but limits one use of your data.

**For sensitive text sharing, use end-to-end encrypted tools.** If you need to share a sensitive document, password, or message with a colleague, don't paste it into a chat with an AI. Use a zero-knowledge encrypted channel where the server never sees your content and data is destroyed after use.

## The Bigger Picture

AI companies face a fundamental tension: they need user data to improve their models, but users expect privacy. Every major AI company has moved toward more data collection over time, not less. The trajectory is clear.

The conversational interface of AI chatbots creates a false sense of intimacy. When you tell ChatGPT something, you're not confiding in a private advisor — you're submitting data to a corporate system with retention policies, human reviewers, and legal obligations.

Privacy isn't about avoiding technology. It's about choosing the right tool for the job. Use AI chatbots for what they're great at — but keep your truly sensitive communications in channels designed for privacy: end-to-end encrypted, zero-knowledge, ephemeral by design.

Your AI conversations are not private. Act accordingly.`,
  },
  {
    slug: "zkchat-is-now-open-source",
    title: "zkChat is Now Open Source",
    date: "2026-01-23",
    description:
      "We are excited to announce that zkChat is now fully open source. Explore, audit, contribute, and build on our zero-knowledge privacy infrastructure.",
    tags: ["Announcement", "Open Source", "Privacy"],
    content: `## zkChat Goes Open Source

Today marks a significant milestone for zkChat: **our entire codebase is now open source** and available on GitHub.

You can find the repositories at [github.com/zkChatOrg](https://github.com/zkChatOrg).

## Why Open Source?

Privacy tools demand transparency. When you use software that claims to protect your communications, you should be able to verify those claims yourself. Open source is not just a development model — it is a commitment to accountability.

By releasing zkChat as open source, we are:

- **Enabling independent security audits:** Anyone can review the code, identify vulnerabilities, and verify that our encryption implementation matches our claims.
- **Building trust through transparency:** You do not have to take our word for it. The code speaks for itself.
- **Inviting community contributions:** Security researchers, developers, and privacy advocates can help improve zkChat.
- **Ensuring longevity:** Even if zkChat as a service disappears, the code remains available for anyone to run.

## What is Included

The zkChat organization on GitHub includes:

**Frontend Application**
- Next.js 16 web application
- Client-side AES-256-GCM encryption
- Ephemeral chat rooms with WebSocket communication
- One-time messages (OTM) with auto-destruction
- Encrypted file drop with expiration

**Relay Server**
- TypeScript WebSocket relay
- Zero-knowledge message forwarding
- No message content logging
- Rate limiting and abuse protection

**Documentation**
- Deployment guides
- Architecture documentation
- Security considerations

## Security Model Remains Unchanged

Open sourcing zkChat does not weaken its security model. In fact, it strengthens it.

The core principles remain:

- **Keys never leave your device:** Encryption keys are generated client-side and stored only in URL fragments, which browsers do not send to servers.
- **The relay is blind:** The server forwards encrypted blobs without access to plaintext content.
- **No accounts, no metadata:** There are no user registrations, no contact graphs, and no message history.
- **Ephemeral by design:** When a room closes, data is destroyed. There is nothing to subpoena or breach.

By making the code public, we invite scrutiny. If there is a flaw in our implementation, we want it found and fixed.

## How to Contribute

We welcome contributions from the community:

1. **Report security vulnerabilities** responsibly via our security contact.
2. **Submit bug reports** through GitHub Issues.
3. **Propose features** that align with zkChat's zero-knowledge philosophy.
4. **Audit the code** and share your findings.
5. **Run your own instance** for personal or organizational use.

## Self-Hosting

With open source access, you can now run your own zkChat instance:

\`\`\`bash
git clone https://github.com/zkChatOrg/zkChat_frontend.git
cd zkChat_frontend
npm install
npm run dev
\`\`\`

Full deployment documentation is available in the repository README.

## What This Means for Users

For existing zkChat users, nothing changes in how you use the service. The web application at zkchat.org continues to operate as before.

What changes is the level of trust you can place in zkChat. You no longer need to trust our claims — you can verify them.

## The Future of zkChat

Open sourcing is not the end of zkChat development. It is an invitation to build together.

We will continue to:

- Maintain the public zkchat.org service
- Release security updates and improvements
- Engage with the community on GitHub
- Expand documentation and deployment options

Privacy is a collective effort. By open sourcing zkChat, we hope to contribute to a broader ecosystem of tools that respect user autonomy and resist surveillance.

## Get Involved

- **GitHub:** [github.com/zkChatOrg](https://github.com/zkChatOrg)
- **Star the repository** to show support
- **Fork and experiment** with your own modifications
- **Join the conversation** in GitHub Discussions

Thank you to everyone who has used zkChat and supported its development. This release is for you.

Privacy is not a feature. It is a foundation.`,
  },
  {
    slug: "eu-chat-control-metadata-surveillance-analysis",
    title: "EU Chat Control and the Structural Weakening of Encrypted Communication",
    date: "2025-11-29",
    description:
      "An analytical examination of the EU's Chat Control proposal, its technical implications for end-to-end encryption, and the shift from content surveillance to metadata collection.",
    tags: ["Policy", "Privacy", "Encryption"],
    content: `## Executive Summary

The European Union's proposed "Chat Control" directive mandates detection orders requiring on-device content scanning in messaging applications. While proponents frame this as a targeted measure against child sexual abuse material (CSAM), cryptographers and security researchers warn that client-side scanning fundamentally undermines the threat model of end-to-end encryption (E2EE). Even when encryption layers remain mathematically intact, mandatory scanning creates new attack surfaces, amplifies vulnerability exposure, and transforms metadata into the primary surveillance vector. This analysis examines the technical architecture of Chat Control, its cryptographic implications, and the practical consequences for users operating under increased regulatory pressure.

## What Chat Control Actually Requires

The EU Chat Control proposal introduces several technical mandates:

**Detection orders** authorize competent authorities to require service providers to implement content scanning mechanisms. These orders apply to both text-based communication and media sharing.

**Mandatory on-device scanning** moves the detection point from server-side processing to client-side execution. This means scanning occurs before encryption, within the user's trusted computing environment.

**AI content analysis** involves machine learning classifiers trained to identify prohibited content patterns. These models operate on unencrypted data streams within the messaging client.

**Hash-matching and pattern detection** compare local content against known CSAM databases using perceptual hashing algorithms. Pattern detection extends beyond exact matches to include probabilistic similarity scoring.

**Metadata collection exposure** becomes necessary for compliance verification, enforcement, and appeals processes. Systems must log detection events, scanning parameters, and user identifiers.

**Real risk of false positives** exists in any probabilistic classification system. Research on PhotoDNA and similar technologies demonstrates false positive rates between 0.1% and 2% depending on threshold configurations.

This effectively breaks the threat model of E2EE even if the encryption layer remains intact. The user's device becomes a potential adversary rather than a trusted endpoint.

## Technical Cryptography Impact

Client-side scanning is functionally equivalent to a backdoor. While the encryption algorithm itself may remain secure, the introduction of scanning logic creates several attack vectors:

**Scanning code becomes a high-value target:** Any component with access to plaintext content before encryption represents a vulnerability. Attackers can exploit scanning modules to exfiltrate data, inject false positives, or disable detection selectively.

**Vulnerability amplification:** A single flaw in scanning implementation affects all users simultaneously. Unlike server-side vulnerabilities that can be patched centrally, client-side compromises require coordinated updates across millions of devices.

**Model poisoning risks:** AI classifiers depend on training data. If adversaries can influence model parameters, they can create evasion techniques or trigger false accusations against specific users.

**Compromised scanning models equal mass compromise:** State-level actors could mandate backdoored detection algorithms, effectively turning every device into a surveillance endpoint.

**Metadata becomes more valuable than content:** Once scanning infrastructure exists, metadata analysis (who communicates, when, with whom, for how long) becomes the primary intelligence target. Content scanning legitimizes infrastructure that enables comprehensive metadata collection.

The cryptographic community's consensus is clear: you cannot maintain end-to-end encryption's security properties while simultaneously scanning content on user devices.

## Comparison of Encryption Architectures Under Chat Control Pressure

Different messaging architectures face varying levels of compliance burden:

**Centralized messengers (WhatsApp, iMessage):** These platforms store encrypted messages on company servers and maintain user account registries. While they implement E2EE for message content, they possess comprehensive metadata: contact graphs, message timestamps, IP addresses, device identifiers, and group membership records. Under Chat Control, these platforms must implement client-side scanning within their applications. Metadata remains fully accessible regardless of scanning implementation.

**Centralized-but-not-fully-encrypted apps (Telegram):** Default chats are server-client encrypted but not end-to-end encrypted. Telegram stores message content on servers, making content-level compliance simpler but also meaning unencrypted data exists in a centralized location. Secret chats use E2EE but represent a minority of usage. Metadata collection is extensive.

**Decentralized protocols (Matrix, XMPP):** Federation distributes message routing across multiple servers but does not eliminate metadata exposure. Each federated node can observe routing information, user presence, and room participation. Client-side scanning must be implemented in client applications, not servers. Enforcement becomes more complex but not impossible.

**Privacy-preserving ephemeral systems (zero-knowledge architectures):** Systems designed around zero-knowledge principles operate differently. These architectures:
- Generate encryption keys locally without server involvement
- Never transmit keys outside URL fragments (which browsers do not send to servers)
- Store no message history or user accounts
- Maintain no metadata beyond transient connection counts
- Destroy all data when sessions terminate

In architectures where keys, messages, and identity material never leave the local runtime, the enforcement of scanning mandates becomes technically unfeasible. There is no persistent data to scan, no account to suspend, and no history to audit retroactively.

## Metadata Exposure: The Real Long-Term Danger

Content scanning receives most public attention, but metadata surveillance poses the more significant long-term threat.

Even with perfect E2EE, metadata reveals:
- **Communication patterns:** Who talks to whom, when, and how frequently
- **Social graphs:** Network analysis can map relationships, identify communities, and predict associations
- **Timing correlation:** Message timing can reveal physical location, daily routines, and behavioral patterns
- **Group structures:** Participation in encrypted groups exposes organizational hierarchies and affiliation networks

Chat Control mandates create legal justification for comprehensive metadata retention. Once infrastructure exists to detect prohibited content, the same systems can log:
- Message send times
- Recipient identifiers  
- Device fingerprints
- IP addresses and geolocation data
- App usage patterns

Historical precedent demonstrates that surveillance infrastructure, once deployed, expands beyond its original scope. Systems built for CSAM detection become tools for monitoring political dissent, tracking journalists' sources, and profiling minority communities.

Metadata-based surveillance is often more revealing than content analysis. You can infer the nature of a relationship, political affiliations, and associational patterns without ever reading a single message.

## Why Ephemeral and Local-Only Systems Become More Relevant

In architectures where keys, messages, and identity material never leave the local runtime, the enforcement of scanning mandates becomes technically unfeasible.

Traditional messaging systems rely on:
- Persistent user accounts
- Server-stored message history  
- Centralized key management
- Metadata databases

Each of these elements creates a compliance surface. Authorities can mandate scanning, seize databases, or compel disclosure.

Ephemeral, zero-knowledge systems operate on different principles:

**No accounts:** Users do not register. No email, phone number, or identity credential is collected. There is no account to suspend or subpoena.

**No logs:** Messages are not stored beyond active session duration. When participants disconnect, data is destroyed.

**No message history:** There is no searchable archive. Past conversations cannot be retroactively accessed.

**No metadata retention:** Servers observe only encrypted ciphertext and transient connection counts. User identities are not linked to IP addresses.

**Peer presence is transient:** Connections exist only while active. No persistent presence information is maintained.

**Cryptographic keys never leave the device:** Encryption keys are generated client-side and embedded in URL fragments. Browsers do not transmit fragment identifiers to servers.

**Nothing exists to scan retroactively:** Without persistent data storage, there is no historical record to audit. Scanning mandates cannot apply to data that was never retained.

This architecture is not designed to evade legitimate law enforcement. Rather, it acknowledges that systems storing comprehensive user data create honeypots for abuse, whether by state actors, corporate malfeasance, or criminal compromise.

Privacy-preserving ephemeral designs become more relevant not because they hide criminal activity, but because they eliminate the surveillance infrastructure that Chat Control seeks to exploit.

## Takeaways for Users in a Chat-Control World

The regulatory environment is shifting toward normalized content scanning. Users concerned with privacy should understand the practical implications and adjust their communication practices accordingly.

**Use ephemeral zero-log channels for sensitive conversations.**

Tools built on zero-knowledge, metadata-free designs (such as zkChat) allow users to temporarily step outside the surveillance surface created by scanning mandates. When conversations occur in rooms that store no history and maintain no user accounts, there is no persistent record to comply with detection orders.

**Do not send sensitive links inside monitored messengers.**

WhatsApp, Telegram, Signal, and iMessage may be subject to content scanning or metadata logging requirements. If you need to share access to a private conversation or document, send only a one-time-use link via those platforms. The actual sensitive discussion can occur in the ephemeral session that link points to, where scanning infrastructure does not exist.

**Avoid apps that store conversations, identity, or contact graphs.**

Applications maintaining server-side message history create permanent records. Even if encrypted at rest, these databases are vulnerable to legal compulsion, state seizure, or targeted breach. Ephemeral systems eliminate this risk by design.

**Use accountless, no-metadata systems when discussing legal, journalistic, political, or private matters.**

Privacy-preserving ephemeral protocols — for example, architectures similar to zkChat — achieve compliance resistance by minimizing data retention. Systems that store nothing have nothing to scan.

**Move sensitive media exchange to ephemeral, client-only encrypted droppers.**

File-sharing services typically store uploads on centralized servers. Chat Control mandates may require scanning of media files during upload or download. Client-side encrypted file drop systems (where files are encrypted in-browser before upload and auto-expire after one-time access) limit exposure windows and eliminate persistent storage.

Important: Frame zkChat as an example category, not as a product suggestion. Privacy-preserving ephemeral protocols achieve compliance resistance by minimizing data retention. Systems that store nothing have nothing to scan.

## Privacy Architecture Comparison Table

| Feature | WhatsApp | Telegram | Signal | iMessage | Matrix | Metadata-Free Ephemeral (e.g., zkChat) |
|---------|----------|----------|--------|----------|--------|----------------------------------------|
| **Stores messages** | Yes (encrypted) | Yes | Yes (encrypted, short TTL) | Yes (encrypted) | Yes (federated) | No |
| **Stores metadata** | Yes | Yes | Yes (minimized) | Yes | Yes (federated) | No |
| **Vulnerable to client-side scanning** | Yes | Yes | Yes | Yes | Yes | No (no persistent data) |
| **Uses accounts** | Yes (phone) | Yes (phone) | Yes (phone) | Yes (Apple ID) | Yes (user@server) | No |
| **Stores contact graphs** | Yes | Yes | Limited | Yes | Yes (federated) | No |
| **Retains identity** | Yes | Yes | Yes | Yes | Yes | No |
| **Ephemeral by design** | No | No | Optional | Optional | No | Yes |
| **Zero-knowledge properties** | Partial (E2EE only) | No (default chats) | Partial (E2EE only) | Partial (E2EE only) | Partial (E2EE + federation) | Yes (keys never reach server) |
| **Susceptible to retrospective exposure** | Yes | Yes | Yes | Yes | Yes | No |
| **Suitable for high-risk use cases** | Limited | No | Limited | Limited | Limited | Yes |

This comparison is factual, not promotional. Each architecture makes different trade-offs between usability, feature richness, and privacy properties. zkChat-style systems prioritize metadata elimination and ephemeral sessions over persistent conversation history and multi-device synchronization.

## Policy and Human Rights Impact

Chat Control's implications extend beyond technical architecture to fundamental rights:

**Journalists** depend on confidential source protection. Mandatory scanning creates chilling effects. Sources fear exposure through false positives, scanning bypass detection, or retroactive analysis of metadata patterns.

**Lawyers** have professional obligations to protect attorney-client privilege. Client-side scanning introduces third-party access to privileged communications, potentially violating legal ethics requirements.

**Whistleblowers** expose corruption, fraud, and institutional misconduct. Scanning mandates increase risk profiles, discouraging disclosure of information in the public interest.

**Minority groups** disproportionately face surveillance. Scanning systems may exhibit bias in classifier training data, leading to higher false positive rates for specific populations.

**Domestic violence survivors** use encrypted messaging to coordinate safety planning, legal assistance, and emergency shelter access. Scanning mandates may inadvertently expose communication patterns to abusers with technical sophistication or institutional access.

**Protest movements** rely on encrypted coordination tools. Metadata analysis combined with scanning infrastructure enables preemptive identification of organizers, mapping of participant networks, and predictive policing interventions.

**Politically exposed persons** in authoritarian regimes face state-level threats. Chat Control sets international precedent that other jurisdictions may adopt with less democratic oversight.

The chilling effect is not hypothetical. Research on surveillance and self-censorship demonstrates measurable behavioral changes when individuals know their communications may be monitored. People avoid certain topics, reduce political expression, and disengage from activism.

Human rights organizations including Electronic Frontier Foundation (EFF), Privacy International, and Access Now have documented these concerns extensively. The UN Special Rapporteur on the right to privacy has warned that client-side scanning fundamentally undermines encryption's protective function.

## A Note on Child Safety

Protecting children from exploitation is one of the most important responsibilities in our society — full stop. We fully support every effort to combat child sexual abuse material and bring perpetrators to justice. This is not a debate about whether children deserve protection. They absolutely do, and no privacy argument changes that.

Our concern is specifically with the technical approach. Breaking the encryption that protects billions of people — including the journalists, lawyers, domestic violence survivors, and whistleblowers described above — does not make children safer. It makes everyone less safe. Security researchers have repeatedly demonstrated that client-side scanning can be circumvented by bad actors while exposing ordinary users to new attack surfaces.

Effective child protection requires targeted law enforcement tools, increased funding for investigation units, better international cooperation, and support for victim services — not mass surveillance infrastructure that weakens the security of every person's communication. We believe it is possible to protect children without structurally undermining the encrypted communication that millions of vulnerable people depend on.

## Conclusion

Chat Control transforms encrypted communication into a scanned communication environment. While encryption protocols may remain mathematically strong, the introduction of mandatory client-side scanning breaks the threat model that makes E2EE meaningful.

The directive's long-term impact will be felt primarily through normalized metadata surveillance. Once scanning infrastructure is legally mandated, the same systems enable comprehensive monitoring of communication patterns, social graphs, and behavioral profiles.

Metadata-free, ephemeral, zero-knowledge designs become more important not as tools to evade legitimate law enforcement, but as architectures that eliminate the data foundations upon which surveillance infrastructure depends.

Systems such as zkChat demonstrate how secure-by-design architectures may evolve in response to regulatory shifts — by removing the very data that scanning systems rely on. When there are no accounts to subpoena, no messages to archive, and no metadata to analyze, compliance with surveillance mandates becomes structurally impossible.

The question is not whether encryption remains mathematically strong. The question is whether the systems built around encryption will preserve or undermine the privacy properties users depend on.`,
  },
  {
    slug: "why-i-built-zkchat",
    title: "Why we built zkChat: True privacy requires zero knowledge",
    date: "2025-01-15",
    description:
      "Most messengers pitch 'privacy' but there's always someone in the middle who could see something. zkChat is different.",
    tags: ["How it works", "Story"],
    content: `Most messengers today pitch **"privacy"** as a feature. End-to-end encryption, disappearing messages, private mode.

But in reality, there is almost always _someone_ in the middle who could see something:

- Servers that store metadata forever
- Cloud backups that silently re-upload your chats
- Companies that need analytics and growth dashboards
- Legal or political pressure to weaken encryption

I wanted something different: a tool that doesn't _want_ to know who you are, who you talk to, or what you say.

**That's why zkChat exists.**

## What zkChat actually is

zkChat is a set of zero-knowledge tools:

- **Ephemeral group rooms** – end-to-end encrypted chats that vanish when everyone leaves
- **One-time messages (OTM)** – links that can be opened exactly once, then self-destruct
- **Private file drop** – files are encrypted client-side and auto-expire

There are **no accounts**, **no usernames**, **no profiles**. Your "identity" in a room is just a local, random persona: a color and a fun name. Reload the page and even that changes.

## Encryption in the browser, not on the server

All encryption happens _on your device_ using **AES-256-GCM**:

- For each room or one-time message, the browser generates a 256-bit key
- That key never leaves your device in plaintext
- Messages or files are encrypted with that key before they ever hit the network

The decryption key is stored in the URL fragment (the part after \`#key=...\`). Browsers do **not** send that fragment to servers.

### The server only ever sees:

- room IDs
- encrypted ciphertext blobs
- basic presence counts (how many sockets are connected)

### It never sees:

- message content
- file content
- encryption keys
- usernames or identities

Even if you gave someone full access to the server, they would see only random bytes.

## Why there's a donate button at all

Running zero-knowledge tools isn't free:

- Servers and bandwidth cost real money
- Abuse protection and rate limiting take time to build
- I want to keep zkChat independent: **no ads**, **no trackers**, **no VC growth pressure**

That's why there are crypto addresses in the footer and on this blog.

Donations keep zkChat:

- **Ad-free**
- **Tracker-free**
- **Account-free**

If zkChat is useful for you, consider it like tipping your favorite open-source project — it's what keeps the lights on without selling your data.`,
  },
  {
    slug: "how-zkchat-works-under-the-hood",
    title: "How zkChat works under the hood (without a math PhD)",
    date: "2025-01-18",
    description:
      "You don't need to be a cryptographer to understand zkChat. Here's the system explained in plain language.",
    tags: ["How it works", "Crypto"],
    content: `You don't need to be a cryptographer to understand the core idea behind zkChat.

Here's the system in **plain language**.

## 1. Keys live in the URL fragment

When you create a room or a one-time message, your browser:

- Generates a random **256-bit key**
- Uses that key with **AES-256-GCM** to encrypt everything
- Puts the key into the URL fragment: \`#key=...\`

**Important detail:** the part after \`#\` is _never sent to the server_. The server only sees the path and query string, not the fragment.

That means:

- The relay server never sees your encryption key
- Only people you share the full link with (including the fragment) can decrypt the content

## 2. The relay is blind

For group rooms, zkChat uses a simple WebSocket relay:

- Your browser opens \`wss://…?roomId=XYZ\`
- When you send a message, the browser:
  - encrypts \`{ senderId, text, createdAt }\` with AES-GCM
  - sends \`{ iv, ciphertext }\` over the socket
- The server just forwards that blob to other clients in the same room

### The relay knows:

- that a room with ID \`XYZ\` exists
- how many connections are currently active

### The relay does NOT know:

- who you are
- what you say
- which persona belongs to which human

All the interesting parts are inside the **ciphertext**.

## 3. One-time messages and files

One-time messages and file drops use a small HTTP API instead of WebSockets:

- Your browser:
  - encrypts the message or file
  - uploads the ciphertext to \`/otm\` or \`/file\`
- The server returns an ID
- You generate a link like \`/otm/<id>#key=...\` or \`/file/<id>#key=...\`

When someone opens the link:

- The browser requests \`/otm/<id>\` or \`/file/<id>\`
- The server returns the ciphertext **once** and immediately **deletes it**
- The browser decrypts locally using the key from \`#key=...\`

If the link was already opened or the TTL expired, the server just returns **"used/expired"**.

## 4. No history, no accounts, no tracking

zkChat deliberately does **not** have:

- login / registration
- global user profiles
- message history
- push notifications
- analytics scripts

Your session is basically:

- a random room ID
- a random senderId
- a short-lived WebSocket connection

When you close the tab or the room burns, it's **gone**.

## Conclusion

zkChat transforms encrypted communication into a scanned communication environment. While encryption protocols may remain mathematically strong, the introduction of mandatory client-side scanning breaks the threat model that makes E2EE meaningful.

The directive's long-term impact will be felt primarily through normalized metadata surveillance. Once scanning infrastructure is legally mandated, the same systems enable comprehensive monitoring of communication patterns, social graphs, and behavioral profiles.

Metadata-free, ephemeral, zero-knowledge designs become more important not as tools to evade legitimate law enforcement, but as architectures that eliminate the data foundations upon which surveillance infrastructure depends.

Systems such as zkChat demonstrate how secure-by-design architectures may evolve in response to regulatory shifts — by removing the very data that scanning systems rely on. When there are no accounts to subpoena, no messages to archive, and no metadata to analyze, compliance with surveillance mandates becomes structurally impossible.

The question is not whether encryption remains mathematically strong. The question is whether the systems built around encryption will preserve or undermine the privacy properties users depend on.`,
  },
  {
    slug: "why-donations-matter-for-privacy-tools",
    title: "Why donations matter for privacy tools (and how crypto helps)",
    date: "2025-01-20",
    description:
      "Most 'free' products are paid for with ads, data, or VC money. zkChat is different—and that's why donations matter.",
    tags: ["Donations", "Sustainability"],
    content: `Most **"free"** products are not actually free.

They are paid for with:

- ads
- data
- profiling
- or VC money that eventually demands growth at any cost

**zkChat is different on purpose.**

## No ads, no tracking, no accounts

To keep zkChat truly zero-knowledge:

- There are **no ad pixels**
- There is **no Google Analytics** or similar trackers
- There are **no user accounts** to monetize later

That also means:

- There is no hidden business model in the background
- Server and bandwidth costs are not magically covered by some big corporation

## What donations are used for

When you send crypto to zkChat donation addresses, it goes into:

- **Infrastructure** — WebSocket relay, HTTP API, storage, domain, TLS certificates
- **Abuse protection** — rate limiting, basic DDoS protection, keeping bad actors out without logging everyone
- **Development time** — improving UX, fixing edge cases, adding new zero-knowledge tools

No money is used for ads or shady growth hacks.

## Why crypto and not traditional payment providers

Privacy tools should **not** depend on traditional payment rails that can be frozen, censored or deanonymized.

zkChat accepts donations in multiple privacy-focused and widely-used cryptocurrencies:

- **Monero (XMR)** — the most privacy-focused cryptocurrency with built-in anonymity
- **Zcash (ZEC)** — shielded transactions for enhanced privacy
- **Bitcoin (BTC)** — borderless, censorship-resistant, programmable money
- **Ethereum (ETH)** — also supports all ERC20 tokens on the Ethereum network
- **Solana (SOL)** — fast and low-fee transactions

These currencies fit the spirit of zkChat much better than a credit card form that requires personal information.

## If zkChat is useful to you

If zkChat:

- helps you share something sensitive
- simplifies your threat model
- or just gives you some peace of mind

consider sending a small donation in any of the supported currencies.

It's the cleanest way to keep this project:

- **independent**
- **privacy-first**
- **sustainably online**`,
  },
  {
    slug: "10-real-world-usecases-for-zkchat",
    title: "10 Real-World Use Cases for zkChat (From Whistleblowers to Couples)",
    date: "2025-11-28",
    description:
      "Explore 10 powerful real-world scenarios where zero-knowledge communication matters, including legal, crypto, relationships, journalism, and more.",
    tags: ["Usecases", "Privacy", "Security"],
    content: `Zero-knowledge tools often sound abstract — until you see how many everyday situations actually _need_ them.

Here are **10 real-world use cases** where zkChat protects you better than conventional apps, including some scenarios most people never think about.

## 1. Sharing sensitive documents with a lawyer

**Keywords:** _send files securely, encrypted document sharing, legal confidentiality_

Think:

- rental contract
- medical documents
- police correspondence
- financial data

With zkChat's **Private File Drop**:

- files are encrypted in your browser
- link works once
- auto-destroy after download or 24h

No cloud storage. No metadata trail.

## 2. Whistleblowing or reporting misconduct

**Keywords:** _anonymous reporting, whistleblower messaging_

When sharing:

- corruption evidence
- HR misconduct
- workplace screenshots

You need _no identity linking whatsoever_.

zkChat provides:

- no accounts
- no IP-based user profiles
- no metadata
- no logging

Pure anonymity.

## 3. Sending passwords, seed phrases, private keys

Never send passwords in Instagram, WhatsApp, or Telegram.

**OTM links self-destruct instantly after reading** — the safest way to share credentials online.

## 4. Couples sharing private photos or intimate notes

zkChat rooms have:

- no history
- auto-burn
- no identity
- no backups

A private moment stays private.

## 5. Journalists communicating with sources

Investigative work requires zero metadata.

zkChat:

- provides ephemeral rooms
- hides identities
- never stores plaintext
- uses AES-256-GCM client-side

Perfect for sensitive conversations.

## 6. Crypto founders exchanging confidential info

Examples:

- tokenomics
- investor lists
- private dashboards
- unreleased product designs

zkChat rooms — fully ephemeral.

## 7. Sending recovery codes, 2FA seeds, backup keys

OTM links excel here. Once opened — permanently deleted.

## 8. Sharing medical information

Healthcare data is extremely sensitive.

Use zkChat for:

- lab results
- diagnosis letters
- prescriptions
- personal health photos

Everything vanishes after reading.

## 9. Teachers, coaches or therapists sending private info

Legal privacy requirements + zero logging = perfect match.

## 10. Anyone who needs to talk without leaving a trace

Some conversations are meant to disappear. zkChat makes that possible.

## Bonus: Private Laptop to Phone Transfers

Use:

- Private File Drop
- QR-code popup

Scan — decrypt — auto-destroy.

## Conclusion

zkChat transforms encrypted communication into a scanned communication environment. While encryption protocols may remain mathematically strong, the introduction of mandatory client-side scanning breaks the threat model that makes E2EE meaningful.

The directive's long-term impact will be felt primarily through normalized metadata surveillance. Once scanning infrastructure is legally mandated, the same systems enable comprehensive monitoring of communication patterns, social graphs, and behavioral profiles.

Metadata-free, ephemeral, zero-knowledge designs become more important not as tools to evade legitimate law enforcement, but as architectures that eliminate the data foundations upon which surveillance infrastructure depends.

Systems such as zkChat demonstrate how secure-by-design architectures may evolve in response to regulatory shifts — by removing the very data that scanning systems rely on. When there are no accounts to subpoena, no messages to archive, and no metadata to analyze, compliance with surveillance mandates becomes structurally impossible.

The question is not whether encryption remains mathematically strong. The question is whether the systems built around encryption will preserve or undermine the privacy properties users depend on.`,
  },
  {
    slug: "the-complete-guide-to-one-time-messages",
    title: "The Complete Guide to One-Time Messages (OTM): When, Why & How to Use Them",
    date: "2025-11-28",
    description: "A deep dive into one-time encrypted messages: why they matter, how they work, and when to use them.",
    tags: ["OTM", "Security", "How it works"],
    content: `One-time messages ("OTM links") are one of the most powerful privacy tools on the internet — and one of the most underused.

This guide explains:

- **when** to use OTM
- **why** they're safer than chats
- **how** they eliminate screenshots, backups, and metadata
- **real-world examples** where they shine

## What Is a One-Time Message?

An OTM link:

1. is encrypted locally with **AES-256-GCM**
2. can be opened exactly **once**
3. deletes itself instantly after being read
4. auto-expires after **7 days** if unused

No metadata. No history. No identity.

## Why OTM Links Are Significantly Safer Than Normal Messaging Apps

### Normal chat apps store:

- metadata
- timestamps
- device fingerprints
- account IDs
- cloud backups

Even if content is encrypted, metadata is **not**.

### OTM on zkChat stores:

- nothing
- no metadata
- no identity
- no history

The server only sees unreadable ciphertext.

## When to Use OTM (Real Examples)

### 1. Sharing passwords or login credentials

**Most common use case worldwide.**

OTM — once opened — gone forever.

### 2. Sharing crypto seed phrases or private keys

Never paste seeds into any social messenger. OTM is the safest option.

### 3. Sending confidential business documents

Use cases:

- pitch decks
- investor spreadsheets
- tokenomics files
- design screenshots

OTM eliminates risk.

### 4. Sharing legal or medical information

Highly sensitive files need a one-time-only view.

### 5. Sending private photos securely

OTM is basically **"self-destruct media"**.

### 6. Sharing access codes, WiFi passwords, alarm codes

Quick, clean, no trace.

### 7. Emotional messages you don't want stored

Breakups, confessions, apologies — all ephemeral.

### 8. Laptop to Phone transfer without cloud accounts

Private File Drop + QR code popup.

## How OTM Prevents Leaks

- **No history**
- **No screenshots synced to cloud**
- **No multi-open replay**
- **No metadata storage**
- **Automatic deletion**

## How OTM Works Technically

\`\`\`text
Sender:
- Encrypts message in browser
- Uploads ciphertext
- Gets link: /otm/<id>#key=<key>

Receiver:
- Opens link
- Server returns ciphertext once
- Immediately deletes stored data
- Browser decrypts locally
\`\`\`

Zero-knowledge.

## Common Questions

**Q: What happens if I reload the OTM page?**

A: The message is already consumed. It can only be opened once.

**Q: Can someone screenshot it?**

A: Technically yes, but there's no cloud sync or backup. The data never existed on a server in plaintext.

**Q: What if I lose the link?**

A: If the key fragment (\`#key=...\`) is missing or lost, the message is unrecoverable. That's by design.

## Conclusion

OTM is what all "disappearing message" features should have been:

- truly one-time
- truly ephemeral
- truly zero-knowledge

Use it anytime you need to share something sensitive without leaving a trace.`,
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
