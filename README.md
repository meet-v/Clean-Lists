# Clean-Lists

Remove unwanted blank lines between list items in Markdown. Adds a command you can run from the Command Palette to clean up lists. Supports two modes:
- Strict mode (default): Only removes indented blank lines (spaces/tabs) that Obsidian treats as part of a list. Preserves a truly empty blank line between separate lists.
- All mode: Removes any blank lines between consecutive list items, merging lists.
- Works on bullet lists (-, *, +), ordered lists (1., 1), and task items (- [ ] etc.).

## Features

- Command Palette action: “Remove blank lines between list items”
- Toggle in settings: Strict in-list only
- Preserves separation between distinct lists in strict mode
- Removes trailing indented blanks at end of a list; keeps no trailing empty line at end of file
- Safe: Operates only on whitespace-only lines; doesn’t alter non-list content

## Why this plugin
Markdown lists can become “loose” or visually odd when indented blank lines sneak in (often due to copy/paste or accidental tabs/spaces on empty lines). This plugin cleans those up without collapsing truly separate lists (in strict mode).
The most prominent case of unwanted lines creeping in is when we copy text from GPT tools like ChatGPT, Perplexity, Gemini, etc. Their standard rendering format shows the list correctly, but when we copy and paste that content in Obsidian, unnecessary tabbed blank lines are added between each list item.

## Behavior details

Strict mode ON:
Between two list items: remove blank lines that contain any spaces/tabs; keep exactly one pure empty blank line if it’s acting as a separator between lists.
After the last item of a list followed by another list: drop any trailing indented blanks; keep exactly one pure empty blank line as the separator.
At end of document: drop trailing indented blanks after the last list item; do not keep a trailing empty line.

Strict mode OFF:
Remove any blank lines between list items (merges lists).
Remove trailing blanks after the last list item, including at end of document.

## Example

Input (strict mode ON):

```
- List 1 Item 1
	
- List 1 Item 2
	
- List 1 Item 3
	
	
- List 1 Item 4
	
- List 1 Item 5
- List 1 Item 6

- List 2 Item 1
- List 2 Item 2
- List 2 Item 3
- List 2 Item 4
- List 2 Item 5
- List 2 Item 6
	

- List 3 Item 1
- List 3 Item 2
- List 3 Item 3
- List 3 Item 4
- List 3 Item 5
- List 3 Item 6
	
```

Output (strict mode ON):

```
- List 1 Item 1
- List 1 Item 2
- List 1 Item 3
- List 1 Item 4
- List 1 Item 5
- List 1 Item 6

- List 2 Item 1
- List 2 Item 2
- List 2 Item 3
- List 2 Item 4
- List 2 Item 5
- List 2 Item 6

- List 3 Item 1
- List 3 Item 2
- List 3 Item 3
- List 3 Item 4
- List 3 Item 5
- List 3 Item 6
```

## Installation

### Manual install (development or testing)

- Clone or download this repository into your vault’s .obsidian/plugins/remove-list-blank-lines folder.
- Run npm install
- Build:
  - Development: npm run dev
  - Production: npm run build

### In Obsidian, enable the plugin in Settings → Community plugins.

> (NOTE: Not available in community plugins as of now. The process is in progress.)

## Usage

- Open the Command Palette and run “Remove blank lines between list items.”
- Configure Settings → Remove List Blank Lines:
  - Strict in-list only (toggle)
    - On: remove only indented blank lines inside lists, preserving separators.
    - Off: remove all blank lines between list items (merges lists).

## Compatibility

Uses only the public Obsidian plugin API and browser-safe code.
Works on desktop and mobile.

## LICENSE
Apache 2.0

## NOTICE
Clean Lists
Copyright (c) 2025 MEET VEKARIA

This product includes software and documentation licensed under the Apache License, Version 2.0.

You may obtain a copy of the License at:
http://www.apache.org/licenses/LICENSE-2.0

Required attribution:
- “Clean Lists” by [MEET VEKARIA](https://github.com/meet-v/).
- Please retain this NOTICE file in redistributions, and display attribution in documentation or “About/credits” screens where third‑party notices normally appear.

Additional notices:
- Portions may include third‑party components; see their respective licenses in the distribution (if any).
- The contents of this NOTICE file are for informational purposes only and do not modify the License.

## Support
If you find issues or have feature requests, open an issue in the repository.

## CREDITS
Created by Meet Vekaria.
