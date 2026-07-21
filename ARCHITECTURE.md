# Architecture Overview

## Data Model
- **User**: Handles authentication and identity.
- **Document**: Core entity storing the rich-text HTML content and metadata. Has a single `ownerId`.
- **DocumentShare**: Junction table mapping `userId` to `documentId` for shared access.

**Why binary access instead of role-based?**  
Sharing grants full binary access (can edit/view) rather than complex role-based permissions (Viewer, Commenter, Editor) to reduce database complexity, simplify the UI, and prioritize shipping the core functionality rapidly.

## Technical Decisions

### Manual Save vs. Autosave
We implemented a manual Save button rather than autosaving on every keystroke. Autosaving rich text reliably requires debouncing, complex optimistic UI updates, and conflict resolution. A manual save is robust, deterministic, and avoids hammering the database with frequent updates.

### Postgres over SQLite
We chose Postgres over SQLite because standard SQLite is tightly coupled to the local disk, making it incompatible with serverless environments like Vercel where the filesystem is ephemeral. Postgres ensures persistent, scalable data storage regardless of where the app is deployed.

## Explicit Deprioritizations
To deliver a functional MVP quickly, the following features were explicitly deprioritized:
- **View/Edit Permission Levels**: Keeping sharing binary saves schema complexity.
- **.docx Upload**: Parsing binary XML formats like `.docx` requires heavy external libraries, whereas `.txt` and `.md` are lightweight and native to text editors.
- **Real-Time Collaboration**: True real-time sync (e.g., Yjs or WebSockets) requires a stateful backend (like a persistent WebSocket server), which contradicts a simple serverless deployment.
- **Version History**: Storing incremental document snapshots drastically increases database storage requirements and logic complexity.

## What I'd Build Next (With 2-4 More Hours)
1. **Debounced Autosave**: Implement a 2-second debounced autosave to improve UX without overloading the database.
2. **Document Deletion**: Add a simple trash/delete flow so users can clean up their dashboard.
3. **Link Sharing**: Allow creating a public, read-only URL for a document that doesn't require an explicit `DocumentShare` record.
4. **Enhanced Markdown Parsing**: Better parsing for `.md` uploads to automatically map markdown elements to Tiptap nodes upon upload.
