# Specification: Event Metadata Guidelines & Multi-Speaker Sessions

This specification defines the product requirements, technical architecture, user flows, and step-by-step implementation plan for introducing multi-line metadata fields (one item per line) for events, mapping these metadata fields to the homepage Bento grid, and allowing multiple speakers to be assigned to agenda sessions.

---

## 1. Product Requirements Document (PRD)

### 1.1 Objectives & Scope
The goal of this feature is to improve the administrative usability of event metadata configuration, align the agenda session structure with real-world scenarios where multiple speakers host a single session, and ensure that the configured metadata dynamically drives the homepage.

#### Must-Haves
- **Multi-line Metadata Textareas**: Replace single-line inputs for "Bénéfices", "Objectifs", "Résultats attendus", and "Public cible" with multi-line `<textarea>` inputs. The administrator enters exactly **one item per line**, ensuring a clean and simple UX.
- **Dynamic Suggestions Engine**: Provide a dropdown for selecting the Event Theme (e.g., *Technologie & Innovation*, *Culture & Art*, etc.) that dynamically displays context-specific suggestion badges below each textarea. Clicking a suggestion badge automatically appends it to the textarea as a new line.
- **Dynamic Homepage Bento Content**: Update the homepage bento grid section (`components/home/WhyUpliftSection.tsx`) to show fixed titles ("Bénéfices", "Objectifs", "Résultats attendus", "Public cible") and display the items typed in the dashboard dynamically as bulleted lists. If no metadata is configured, fall back to the default marketing descriptions.
- **Multi-Speaker Sessions**: Allow administrators to assign between 0 and 10 speakers per session.
- **Overlapping Avatars Display**: Render speakers on the public session view as overlapping circular avatars (GitHub style) displaying full names in tooltips on hover.

#### Should-Haves
- **Ramp Migration Compatibility**: Ensure that old event metadata (previously stored as free-form strings) is parsed cleanly. If metadata is stored as a string or legacy text, convert it to lines properly for the textarea and homepage list.
- **UI Consistency**: Ensure the metadata textareas match the style and behavior of the existing ticket benefits textareas inside the ticket manager.

---

## 2. Technical Requirements Document (TRD)

### 2.1 Configuration Management
Create a dynamic suggestion store in `config/event-suggestions.json` mapping event thématiques (keys: `tech`, `culture`, `leadership`, `education`) to lists of string values.

### 2.2 Metadata Parsing & Formatting Logic
1. **Read & Parse (Display)**:
   Read the JSON stored inside `location_details`. For each metadata key (`benefits`, `objectives`, `outcomes`, `audience`), safely resolve it into a newline-separated string:
   ```typescript
   const parseMetadataField = (val: any): string => {
     if (!val) return '';
     if (Array.isArray(val)) return val.join('\n');
     if (typeof val === 'string') {
       // Check if it's stringified JSON array
       if (val.startsWith('[')) {
         try {
           const parsed = JSON.parse(val);
           if (Array.isArray(parsed)) return parsed.join('\n');
         } catch (e) {}
       }
       // Fallback to legacy plain string
       return val;
     }
     return '';
   };
   ```
2. **Format & Write (Save)**:
   When saving the event, split the textarea string content by newlines, trim trailing whitespace, filter out empty lines, and store as a JSON array:
   ```typescript
   const formatMetadataField = (text: string): string[] => {
     return text
       .split('\n')
       .map(line => line.trim())
       .filter(line => line.length > 0);
   };
   ```
   Save the final payload inside `location_details` as stringified JSON:
   ```json
   {
     "benefits": ["Networking professionnel", "Certificat de participation"],
     "objectives": ["Apprentissage de technologies"],
     "outcomes": ["Prototype fonctionnel"],
     "audience": ["Développeurs"]
   }
   ```

### 2.3 Homepage Bento Rendering Logic
In `components/home/WhyUpliftSection.tsx`, implement a helper function to safely transform the metadata value (which can be a JSON array, legacy string, or empty) into a React bullet list node or a string:
```typescript
const renderDescription = (value: any, defaultText: string) => {
  if (!value) return defaultText;
  
  let list: string[] = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (typeof value === 'string') {
    if (value.startsWith('[')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = value.split('\n').map(s => s.trim()).filter(Boolean);
      }
    } else {
      list = value.split('\n').map(s => s.trim()).filter(Boolean);
    }
  }

  const filteredList = list.filter(item => item.trim().length > 0);
  if (filteredList.length === 0) return defaultText;

  return (
    <ul className="list-disc pl-4 space-y-1.5 mt-2 text-left">
      {filteredList.map((item: string, idx: number) => (
        <li key={idx} className="text-xs md:text-sm leading-relaxed">{item}</li>
      ))}
    </ul>
  );
};
```

### 2.4 Database Mutations (Sessions)
The `session_speakers` join table already has a composite primary key `(session_id, speaker_id)` that naturally supports multiple speakers.
1. When saving a session with speaker IDs `[id1, id2, id3]`:
   - Delete all rows in `session_speakers` matching the `session_id`.
   - Perform a bulk insert of the new rows:
     ```typescript
     await supabase.from('session_speakers').insert(
       speakerIds.map(spkId => ({ session_id: sessionId, speaker_id: spkId }))
     );
     ```
2. Both actions run client-side inside a sequential execution chain in `app/admin/sessions/page.tsx`.

---

## 3. App Flow Mapping

```mermaid
graph TD
    A[Admin Open Event Form] --> B[Choose Theme Dropdown]
    B --> C[Theme Loaded: tech | culture | leadership | education]
    C --> D[Render Textareas for Benefits, Objectives, Outcomes, Audience]
    D --> E[Click Suggestion Chip]
    E --> F[Suggestion text appended as a new line in textarea]
    F --> G[Save Event]
    G --> H[Textarea contents split by newlines and saved as JSON array in location_details]
    H --> Z[Homepage Loaded: WhyUpliftSection fetches eventMetadata and renders descriptions as bulleted lists]

    I[Admin Open Session Form] --> J[Search & Add Speakers]
    J --> K[Selected Speakers added to list as pills]
    K --> L[Save Session]
    L --> M[Delete previous session_speakers links]
    M --> N[Bulk insert new session_speakers links]
```

---

## 4. UI/UX Design Brief

### 4.1 Metadata Textarea Styling
- **Textarea Inputs**: Border `1px solid var(--border-default)`, padding `8px 12px`, background `var(--bg-surface)`, rounded-md, font-size `14px`, `rows={3}` to keep the vertical stack compact.
- **Helper text**: Under each textarea, a small note: `"Un élément par ligne."` in `font-size: 11px; color: var(--text-muted)`.
- **Suggestion Chips**: Below the helper text, render a flex wrap of suggested items. Styling: Background `var(--bg-lavender)` (`#F3F2FC`), text `var(--text-secondary)`, hover state `rgba(104, 66, 255, 0.15)`, cursor pointer, font-size `11px`, padding `3px 8px`, rounded-full.
- **Click Behavior**: Clicking a chip appends the text as a new line inside the textarea, focusing the textarea, and updating the state:
  ```typescript
  const handleAddSuggestion = (field: string, suggestion: string) => {
    const currentValue = form[field] ? form[field].trim() : '';
    const newValue = currentValue ? `${currentValue}\n${suggestion}` : suggestion;
    setForm({ ...form, [field]: newValue });
  };
  ```

### 4.2 Overlapping Avatars Styling
- **Avatar Ring**: Height and width `32px` (`w-8 h-8`), border `2px solid #FFFFFF`, border-radius `50%`, margin-left `-8px` (`-space-x-2` wrapper parent).
- **Tooltip**: Positioned `absolute`, `bottom: 125%`, `left: 50%`, transformed `translateX(-50%)`, bg `#0A0A0E`, text `#FFFFFF`, text-size `10px`, padding `4px 8px`, rounded-md, shadow, hidden by default (`hidden` or opacity 0), displaying on hover (`group-hover:block`).

---

## 5. Backend Schema & RLS Policies

No modifications are required for the PostgreSQL database schema as both tables already support these structures:
- `events.location_details`: type `TEXT` -> Stores stringified JSON `{ benefits: string[], objectives: string[], outcomes: string[], audience: string[] }`.
- `session_speakers`: type `JOIN TABLE` -> Maps `(session_id, speaker_id)` with Cascade Delete. RLS policy allows admins to insert/delete records.

---

## 6. Implementation Plan

### Task 1: Initialize Event Suggestions Config File
- **File**: `config/event-suggestions.json`
- **Verification**: Ensure the file exists and contains valid JSON with keys: `tech`, `culture`, `leadership`, `education`.

### Task 2: Implement Textareas and Suggestions in Events Admin
- **File**: `app/admin/events/page.tsx`
- **Implementation**:
  - Add tag management states for the 4 metadata fields.
  - Implement a `Textarea` UI that handles:
    - Text entry separated by return keys.
    - Appending suggestions to the text area when badges are clicked.
  - Safely parse initial values in `openEdit`:
    ```typescript
    const parseMetadataArray = (val: any): string => {
      if (!val) return '';
      if (Array.isArray(val)) return val.join('\n');
      if (typeof val === 'string') {
        if (val.startsWith('[')) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed.join('\n');
          } catch(e) {}
        }
        return val;
      }
      return '';
    };
    ```
- **Verification**: Run `npm run build` and ensure zero TypeScript errors.

### Task 3: Build Multi-Speaker Selector in Sessions Admin
- **File**: `app/admin/sessions/page.tsx`
- **Implementation**:
  - Replace `speaker_id` form state with `speaker_ids` string array.
  - Design a multi-select dropdown that shows a checkbox list of all available speakers, showing selected speakers as pills above/inside the list.
  - Update `openEdit` to set `speaker_ids: s.session_speakers ? s.session_speakers.map((item: any) => item.speaker_id) : []`.
  - Update `handleSave` to:
    1. Update the session details.
    2. Clear old session speakers: `await supabase.from('session_speakers').delete().eq('session_id', sessionId)`.
    3. Bulk insert the new session speakers:
       ```typescript
       if (form.speaker_ids.length > 0) {
         await supabase.from('session_speakers').insert(
           form.speaker_ids.map((id: string) => ({ session_id: sessionId, speaker_id: id }))
         );
       }
       ```
- **Verification**: Test the API requests using a local scratch script to verify the session-speaker inserts.

### Task 4: Update Session Avatars on Public Event Detail Page
- **File**: `app/events/[id]/page.tsx`
- **Implementation**:
  - Fetch all session speakers from `session_speakers(speakers(*))` in the main event details query.
  - In `SessionCard`, replace the `primarySpeaker` display with a loop over `session.session_speakers`.
  - Render overlapping circular avatars using Tailwind classes `-space-x-2` and custom CSS tooltip triggers on hover.
- **Verification**: Run `npm run build` and inspect the output.

### Task 5: Dynamic Bento Grid Display on Homepage
- **File**: `components/home/WhyUpliftSection.tsx`
- **Implementation**:
  - Keep the bento cards titles static: "Bénéfices", "Objectifs", "Résultats attendus", "Public cible".
  - Add `renderDescription` helper to parse metadata values (arrays or strings) and generate a bulleted `<ul>` list.
  - Set `description` in the bento assets array to the result of calling `renderDescription(eventMetadata?.benefits, defaultText)` etc.
- **Verification**: Run `npm run build` to ensure no layout breakages.
