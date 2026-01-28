# Snapflw Mini-Jobs TODO List

## 🎨 UI & Aesthetics (Neobrutalism)
- [ ] **Cursor Style**: Create a custom SVG cursor that matches the thick-border aesthetic.
- [ ] **Active Tab State**: Highlight the current page in the Navigation bar.
- [ ] **Toast Notifications**: Create a `<neo-toast>` component for success/error messages (like "Saved!").
- [ ] **Loading Spinner**: Design a blocky, neobrutalist loading spinner for file imports.
- [ ] **Draggable Ghost**: Make the element semi-transparent or tilted while being dragged.
- [ ] **Grid Background**: Add a toggle for a dot or grid pattern background in the editor workspace.
- [ ] **Tooltip Component**: Create a `<neo-tooltip>` that pops up on hover over icons.
- [ ] **Dark Mode**: Define a `[data-theme="dark"]` set of variables in CSS.
- [ ] **Rainbow Borders**: Add a variant to `<neo-card>` that cycles border colors on hover.

## 🧩 Web Components (`components.js`)
- [ ] **Toggle Switch**: Build a `<neo-toggle>` component for boolean settings.
- [x] **Dropdown Menu**: Create a custom `<neo-select>` with thick borders.
- [ ] **Progress Bar**: Implement a `<neo-progress>` bar for loading workflows.
- [ ] **Modal Component**: Standardize the Preview Modal into a reusable `<neo-modal>`.
- [ ] **Accordion**: Create a `<neo-accordion>` for the sidebar block categories.
- [ ] **Textarea**: Add a multi-line `<neo-textarea>` input component.
- [ ] **Avatar**: Create a `<neo-avatar>` placeholder for user profiles.
- [ ] **Breadcrumbs**: Add a breadcrumb navigation component for deep pages.
- [ ] **Copy Button**: Make a dedicated `<neo-copy-btn>` that changes icon when clicked.
- [ ] **Tag Input**: Create an input that converts comma-separated text into `<neo-badge>`s.

## 🛠️ Editor Functionality
- [ ] **Delete Key**: Bind the `Delete` / `Backspace` key to remove selected blocks.
- [ ] **Duplicate Block**: Add `Ctrl+D` to duplicate the selected block.
- [ ] **Clear Canvas**: Add a "Clear All" button with a confirmation dialog.
- [ ] **Undo**: Implement a basic history stack (just for block placement).
- [ ] **Redo**: Implement the forward stack for the Undo feature.
- [ ] **Zoom**: Add `+` and `-` buttons to scale the `#dragboard` div.
- [ ] **Pan**: Allow holding `Space` + Drag to move around the canvas.
- [ ] **Snap to Grid**: Force blocks to align to a 10px or 20px grid when dropped.
- [ ] **Multi-Select**: Allow `Shift+Click` to select multiple blocks (visually).
- [ ] **Auto-Save**: Save `current.snapf` to `localStorage` every 30 seconds.

## 🔌 Blocks & Logic
- [ ] **Comment Block**: Add a "Note" block that doesn't execute but holds text.
- [ ] **Color Picker**: Add a color property to blocks to categorize them visually.
- [ ] **Start/End Flags**: Visually distinct styles for "Trigger" (Start) vs "Action" (End) blocks.
- [ ] **Block Search**: Filter the sidebar items in real-time as you type in the search box.
- [ ] **Connection Validation**: Prevent connecting an input to an input (if directionality matters).
- [ ] **Double click to Edit**: Open a modal to edit block content on double-click.
- [ ] **Execution Order**: Add little numbers (1, 2, 3) to blocks to show flow order.
- [ ] **Block Icons**: Add support for emojis or SVG icons inside the Block data structure.
- [ ] **Error State**: Add a visual "red error mode" style for blocks with invalid config.
- [ ] **Minimap**: Create a tiny box in the corner showing a zoomed-out view of the flow.

## 📄 File System & SEO
- [ ] **Favicon**: Add a pixel-art or blocky favicon to the HTML head.
- [ ] **Page Title**: Update the `document.title` dynamically based on the open file name.
- [ ] **File Drop**: Allow dragging a `.snapf` file from the OS desktop directly onto the canvas.
- [ ] **Description Field**: Add a metadata field for "Description" in the `.snapf` file.
- [ ] **Version Control**: Add a version number to the `.snapf` metadata.
- [ ] **Welcome Screen**: Check if `localStorage` is empty and show a "Welcome Tour".
- [ ] **Keyboard Shortucts Modal**: Create a help screen listing all hotkeys.
- [ ] **Mobile Warning**: Show a banner on screens < 600px saying "Desktop Recommended".
- [ ] **Github Link**: Add a link to your repo in the footer or settings.
