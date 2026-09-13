# AI Resume Chat — bigger composer, collapsible chat list & side context panel (resume / report / job)

_Written 2026-09-13 against qorva-ai-app @8d25350 (`develop`), branch
`feature/resume-chat-context-panel`. Frontend only — no API change._

> **IMPLEMENTED 2026-09-13** — steps 1–7, uncommitted on the branch. As designed, with two
> details worth knowing: the auto-collapse of the chat list below `md` is not persisted (only
> the explicit toggles are), and `JobPostReadView` owns its own copy-reference state, so
> `JobsContent` lost `copiedJobRef`/`handleCopyJobRef` and seven now-unused icon imports (its
> lint error count went 26 → 20, none new). Vite build clean. Checks 1–8 still to run by hand.

## 1. What is asked

1. The message composer is too small.
2. Split the conversation area 50/50: messages on the left, a **collapsible** panel on the
   right with three tabs — **Resume**, **Matching report**, **Job description**.
3. Make the **chat list** (left column) collapsible too, so a recruiter working in one chat
   can give the whole width to messages + context.

## 2. Current state

### 2.1 Composer (`AppAIResumeChat.jsx:916-940`)

`TextField size="small" multiline maxRows={4}` — renders as a single 40 px line and only
grows while typing. Enter sends, Shift+Enter inserts a newline (`onKeyDown`, line 925). The
send button is a fixed 38 px square vertically centred on the row, which looks off once the
field is taller.

### 2.2 Layout (`AppAIResumeChat.jsx:454-960`)

```
<Box column>                                     line 412
 ├─ page toolbar: title, refresh, New Chat        line 415
 └─ <Box flex row>                                line 454
      ├─ chat list   width 200/240/280 (xs/sm/md) line 456   (status filter chips + list)
      └─ conversation column  flex 1, column      line 640
           ├─ header (avatar, title, score chip, ⋮)  line 641
           ├─ messages  flex 1, overflowY auto    line 775
           └─ composer                            line 908
```

The chat list is a fixed-width column with no way to hide it; the conversation column is a
single flex item, so there is no place for a side panel yet. On a 1280 px screen the
conversation gets ~1000 px; halving that for the context panel leaves 500 px per side,
which is why hiding the chat list matters once the panel exists.

### 2.3 What already exists and can be reused

| Content | Existing component | Reusable as-is? |
|---|---|---|
| Resume | `cv/AppCVDetails.jsx` — `({ cv, onClose, onUpdate })`, own action bar (anonymize, print, copy ref, close), tabs Resume / Clustering, inline edit of tags & availability. Root is `height:100%` flex column with internal scroll. Fetches the tenant logo on mount (`/tenants/logo` blob, lines 400-418). | **Yes.** Pass `cv`, omit `onClose` (the panel has its own collapse), pass `onUpdate` so tag/availability edits made from the chat stay in sync. |
| Matching report | `reports/AppMatchingReportDetails.jsx` — `({ reportData })`, own toolbar (print), gauges, sections. Root is `width/height:100%` with internal scroll. Also fetches the tenant logo. Renders an empty state itself when `reportData` is null (`appCVMatching.noAnalysisResult`). | **Yes.** Feed it the `linkedReport` the header already loads. |
| Job description | **Not a component.** `jobs/JobsContent.jsx` renders the read view inline: `descriptionToHtml()` (line 824, Quill/HTML/plain-text normaliser + DOMPurify) inside the `detailTab === 0` block (lines 1440-1446), and `JobScoringView` (line 501) for the scoring rules tab. | **No — extract first** (see §3.3). |

Data the chat already has: `selectedChat.context.cvId`, `selectedChat.context.jobPostId`,
and `linkedReport` (looked up by pair on select). Missing fetchers: `getCVById(id)` exists
in `cvService.js:18`; **`jobService.js` has no by-id getter** although
`GET /jobs/{id}` exists (`AbstractQorvaController.findOneById`).

## 3. Design

### 3.1 Composer

- `TextField` → `minRows={3} maxRows={10}`, drop `size="small"`, `fontSize: '0.9rem'`,
  padding `12px 14px`. Three visible lines at rest is the size recruiters expect for a
  question; it still grows for pasted text and scrolls past 10 rows.
- Composer row `alignItems: 'flex-end'` so the send button sits on the last line; bump the
  button to 42 px.
- Keep Enter = send, Shift+Enter = newline. Add a muted hint under the field
  (`appAIResumeChat.composerHint`: "Enter to send · Shift+Enter for a new line") — it is the
  first time the field is tall enough for people to expect Enter to insert a line.

### 3.2 Three-column layout, two collapsible sides

```
page toolbar:  [☰ chats]  AI Resume Chat …………………………  ⟳  [+ New Chat]
<Box flex row, minHeight 0>
 ├─ chat list        flex 0 0 280px   (hidden when collapsed)
 └─ conversation column (flex 1)
      ├─ header  avatar · title · score chip · [◫ context] · ⋮
      └─ <Box flex row, minHeight 0>
           ├─ messages + composer  flex: 1 1 50%   (100% when the panel is collapsed)
           └─ context panel        flex: 0 0 50%   borderLeft, hidden when collapsed
```

Both side columns collapse independently; the messages column always takes what is left.

**Chat list toggle**
- Icon button at the far left of the page toolbar (`MenuOpenOutlined` when open,
  `MenuOutlined` when closed; tooltip `appAIResumeChat.hideChats` / `showChats`). Putting it
  in the toolbar rather than inside the list keeps it reachable when the list is hidden.
- State `chatListOpen`, persisted in `localStorage` (`qorva.chat.listPanel` =
  `"open" | "closed"`), default **open**.
- When collapsed the column is removed entirely (no mini-rail) — the toolbar still shows the
  selected chat's title in the conversation header, and New Chat / refresh stay in the
  toolbar, so nothing the list offered is lost except browsing.
- **Selecting a chat below `md` collapses the list automatically** (there is no room for
  three columns on a tablet); on `≥ md` selection leaves it as it is. Creating a chat never
  collapses it.
- The status filter chips live inside the list; they hide with it — expected.
- Keyboard: no shortcut for now (the app has none elsewhere).

**Context panel toggle**
- Icon button in the conversation header, left of ⋮ (`ViewSidebarOutlined`, tooltip
  `appAIResumeChat.showContext` / `hideContext`), state `contextOpen` persisted in
  `localStorage` (`qorva.chat.contextPanel` = `"open" | "closed"`, default **open** on
  `≥ md`, closed below). The file already has the `ls()` helper for reads.
- **Responsive**: at `< md` (≈ 900 px) the 50/50 split leaves ~300 px per column, which is
  unusable for the report gauges. Below `md` the panel renders as a right-anchored MUI
  `Drawer` (`width: min(560px, 92vw)`) opened by the same button; above `md` it is the inline
  50 % column. One `ContextPanel` component, two hosts.
- **Message bubbles**: at 50 % width the current `maxWidth: 88%` for assistant bubbles is
  fine; no change.

### 3.3 `ChatContextPanel` component (`chats/ChatContextPanel.jsx`)

Props: `{ chat, report, onReportRefresh, onCvUpdated }`.

```
┌ Tabs: Resume | Matching report | Job description ─────────┐  MUI Tabs, 0.8rem, green indicator
│ tab body: flex 1, minHeight 0, overflow hidden             │  each child scrolls itself
└────────────────────────────────────────────────────────────┘
```

- **Resume tab** → `getCVById(chat.context.cvId)` on chat change (cache per `cvId` in a
  `useRef` map so switching tabs doesn't refetch) → `<AppCVDetails cv={cv} onUpdate={…} />`.
  Loading: centred `CircularProgress`; error: `resolveError(e)` text.
- **Matching report tab** → `<AppMatchingReportDetails reportData={report} />`. When `report`
  is null, render the chat's own empty state instead of the component's generic one: the
  amber "No screening report — run screening" chip already used in the header, plus one line
  of `appAIResumeChat.noReportYetHint`, plus a **Refresh** button calling `onReportRefresh`
  (= `loadLinkedReport(selectedChat)`) for the case where screening was just run in another
  tab.
- **Job description tab** → `getJobById(chat.context.jobPostId)` (new, see below) → new
  `jobs/JobPostReadView.jsx` = description block + scoring rules, extracted from
  `JobsContent`:
  - move `descriptionToHtml`, `HTML_DESCRIPTION_REGEX`, `escapeHtml` to
    `src/utils/jobDescription.js` (pure functions, DOMPurify stays inside);
  - move `JobScoringView` (+ its `SectionTitle`/`CVCard`/`CVSectionHeader` helpers) to
    `jobs/JobScoringView.jsx`;
  - `JobPostReadView({ job, showScoringRules = true })` renders title + reference (copy
    button as in JobsContent) + the sanitised description block (same `sx` as lines
    1438-1446) + `JobScoringView` under a small "Scoring rules" subheading;
  - `JobsContent.jsx` imports the three and its `detailTab === 0/1` blocks shrink to
    `<JobPostReadView … />`. Behaviour unchanged there — that's the regression to check.
- Selected tab persisted in `localStorage` (`qorva.chat.contextTab`), default Resume.
- Tenant logo: both `AppCVDetails` and `AppMatchingReportDetails` fetch `/tenants/logo` on
  mount. Mounting only the active tab's component (not all three) keeps that to one fetch
  per tab switch; acceptable. Do **not** keep all three mounted.

### 3.4 Services

- `jobService.js`: add `export const getJobById = (id) => apiClient.get(\`/jobs/${id}\`);`
- No backend change: `GET /jobs/{id}`, `GET /cvs/{id}`, `POST /matching-reports/search`
  all exist and are tenant-scoped.

### 3.5 i18n (7 locales, `appAIResumeChat.*`)

`composerHint`, `showChats`, `hideChats`, `showContext`, `hideContext`, `tabResume`,
`tabReport`, `tabJob`, `refreshReport`. (`noReportYetHint`, `runScreening` already exist.)

## 4. Implementation plan

| # | Step | Files | Risk |
|---|---|---|---|
| 1 | Composer: rows, size, hint, button alignment (3.1) | `AppAIResumeChat.jsx`, locales | none |
| 2 | Extract job read view (3.3 bullets) — **pure refactor, JobsContent behaviour identical** | `utils/jobDescription.js`, `jobs/JobScoringView.jsx`, `jobs/JobPostReadView.jsx`, `JobsContent.jsx` | medium — verify the Jobs screen (description rendering incl. the Quill `<pre>` case, scoring tab) before moving on |
| 3 | `getJobById` | `jobService.js` | none |
| 4 | `ChatContextPanel` with the three tabs + loading/empty states | `chats/ChatContextPanel.jsx`, locales | low |
| 5 | Split layout, context toggle, persistence, `< md` Drawer host (3.2) | `AppAIResumeChat.jsx` | low — the header/messages/composer JSX moves one level deeper, nothing else changes |
| 6 | Collapsible chat list: toolbar toggle, persistence, auto-collapse on select below `md` (3.2) | `AppAIResumeChat.jsx`, locales | none — the list column is wrapped in `{chatListOpen && (…)}` |
| 7 | Wire `onCvUpdated` (update `cvList`/title if the name changed — tags/availability don't affect the chat) and `onReportRefresh` | `AppAIResumeChat.jsx` | none |

Ship order: 1 and 6 are independent quick wins; 2–5 and 7 together.

### Checks

1. Composer shows three empty lines, grows to ten, Enter sends, Shift+Enter breaks the line.
2. Open a chat ≥ md: messages left, panel right, each exactly half; toggle hides the panel
   and messages fill the width; state survives a reload.
3. Resize below md: panel becomes a drawer; the toggle opens it; messages keep full width.
3b. Chat list: toolbar button hides/shows it, state survives a reload; with list hidden and
    panel open, messages and panel are each half of the full width; below md, clicking a
    chat hides the list and the toolbar button brings it back; New Chat still works with the
    list hidden and the new chat becomes the selected one.
4. Resume tab shows the same content as CV library → details for that CV (edit a tag from
   the chat → visible in the CV library afterwards).
5. Matching report tab: with a report, same view as Reports → details; without, the amber
   CTA + Refresh; run screening elsewhere, press Refresh → report appears and the header
   chip turns green.
6. Job description tab: same rendering as Jobs → details (including a job whose description
   was pasted as plain text into Quill); scoring rules visible.
7. Jobs screen unchanged after the extraction.
8. Switching chats switches all three tabs' content; switching tabs does not refetch.

## 5. Out of scope / later

- Resizable divider (drag to change the 50/50). MUI has no split pane; would need
  `react-resizable-panels`. Fixed halves first, decide after use.
- Cross-highlighting (click a skill in the report → scroll the CV to it).
- Letting the assistant "point" at the panel (e.g. an answer that opens the report tab).
