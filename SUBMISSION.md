# Assignment Submission & Status

Thank you for reviewing my project! Below is a comprehensive breakdown of the deployment, features, and future roadmap.

---

## Live Deployment
**Live URL**: https://ajaia-assignment-jet.vercel.app/

*(Note: The database is hosted on the Neon Free Tier. If the app has been inactive for 5 minutes, the database goes to sleep. Your first request/login might take 3-5 seconds to wake it up, after which it will be lightning fast!)*

### Demo Accounts
To test the sharing functionality, you can use these pre-seeded demo accounts:
- **Account 1**: `8hannankhan0@gmail.com` | Password: `qwerty1234`
- **Account 2**: `9hannankhan00@gmail.com` | Password: `qwerty1234`

---

## What is Fully Working

- **Document CRUD**: Creating new documents, renaming titles inline, manual saving, and viewing recent documents on the dashboard.
- **Rich-Text Editor**: Editing content with full support for bold, italic, underline, heading sizes, text color, alignment, and bulleted/numbered lists using Tiptap.
- **Sharing & Access**: Binary access sharing via email, featuring a visible distinction between "Owned" and "Shared" documents on the dashboard.
- **File Upload**: Uploading `.txt` and `.md` files which are automatically parsed and converted into new editable documents.
- **Persistence**: PostgreSQL database persistence (via Prisma) ensuring documents, metadata, and sharing states survive across refreshes.

---

## What is Incomplete or Simplified

- **Permission Levels**: Sharing is binary (you either have access to edit/view, or you don't). Distinct View/Comment/Edit roles were omitted to keep the database schema clean and simple.
- **.docx Upload**: We strictly support `.txt` and `.md`. Binary `.docx` files require heavy parsers, which were excluded to prioritize core application stability.
- **Real-Time Collaboration**: True real-time cursor sync (like WebSockets or Yjs) was intentionally deprioritized to better fit a simple serverless Vercel deployment.
- **Autosave**: Saving is manual. Debounced autosave was skipped to avoid excessive database writes and conflict resolution edge cases in this MVP.

---

## What I'd Build Next (With 2-4 More Hours)

1. **Meaningful Automated Testing**: Integrate Vitest and React Testing Library to write meaningful test suites covering the core document parsing and sharing logic.
2. **Debounced Autosave**: Implement a 2-second debounced save to dramatically improve UX without hammering the database.
3. **Link Sharing**: Allow the creation of a public, read-only URL for a document that doesn't require an explicit user-to-user share.
4. **Document Deletion**: Add a proper trash/delete flow so users can clean up their dashboard.

---

## Source Code & Submission Contents
**GitHub Repository**: [https://github.com/Hannankhan00/ajaia-assignment](https://github.com/Hannankhan00/ajaia-assignment)
**Google Drive Folder**: [Submission Link](https://drive.google.com/drive/folders/1WIQ0vOf_H36hFGfo1vL8AHjZww8OKmPl?usp=sharing)

Included in this submission:
- `Source Code`: The complete Next.js application codebase.
- `README.md`: Local setup instructions, tech stack, and run instructions.
- `ARCHITECTURE.md`: Architecture note outlining the data model, technical tradeoffs, and decisions.
- `AI_WORKFLOW.md`: A summary of the hybrid AI (Claude + Gemini) development workflow.
