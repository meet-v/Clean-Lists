import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

interface RemoveListBlankLinesSettings {
  strictInListOnly: boolean;
}

const DEFAULT_SETTINGS: RemoveListBlankLinesSettings = {
  strictInListOnly: true
};

// Detect list items: bullets (- + *), tasks (- [ ] etc.), and ordered (1. / 1) )
const listItemRegex = /^\s*(?:[-+*]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)/;

// Whitespace-only line (spaces/tabs only, possibly length 0)
const whitespaceOnlyRegex = /^[ \t]*$/;

function isListItem(line: string): boolean {
  return listItemRegex.test(line);
}

// True if the line is blank and contains at least one space or tab
function isIndentedBlank(line: string): boolean {
  if (!whitespaceOnlyRegex.test(line)) return false;
  // Line length > 0 implies at least one space/tab (since only [ \t]* allowed)
  return line.length > 0;
}

/**
 * Remove blank lines between list items.
 * Strict mode:
 *  - Between two list items: remove only indented blanks; keep one pure empty to separate distinct lists.
 *  - After the last item of a list:
 *      - If next non-blank starts another list: remove indented blanks; keep exactly one pure empty as separator.
 *      - If end of document: remove indented blanks; keep no trailing pure empty.
 * Non-strict mode:
 *  - Remove all blank lines between list items (merges lists) and drop trailing blanks after a list item.
 */
function removeBlankLinesBetweenListItems(text: string, strictInListOnly: boolean): string {
  const lines = text.split("\n");
  const out: string[] = [];

  let blankBuffer: string[] = [];
  let prevNonBlank: string | null = null; // last emitted non-blank line

  const flushBlankBuffer = () => {
    for (const b of blankBuffer) out.push(b);
    blankBuffer = [];
  };

  const dropBlankBuffer = () => {
    blankBuffer = [];
  };

  // Helper to decide the final flushing at EOF according to strict/non-strict mode
  const flushTail = () => {
    if (blankBuffer.length === 0) return;

    const prevIsList = prevNonBlank !== null ? isListItem(prevNonBlank) : false;

    if (!prevIsList) {
      // Previous content is not a list item; keep blanks as-is
      flushBlankBuffer();
      return;
    }

    if (!strictInListOnly) {
      // Non-strict: drop all trailing blanks after a list item
      dropBlankBuffer();
      return;
    }

    // Strict:
    // At EOF, there is no "next list", so we must drop indented blanks and keep no trailing pure empty.
    const hasIndented = blankBuffer.some(isIndentedBlank);
    if (hasIndented) {
      // Remove all indented blanks; at EOF we do not keep any pure empty separator either.
      dropBlankBuffer();
      return;
    }

    // Only pure empty blanks remain. At EOF, keep none.
    dropBlankBuffer();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Buffer whitespace-only lines until we see what follows
    if (whitespaceOnlyRegex.test(line)) {
      blankBuffer.push(line);
      continue;
    }

    // We have a non-blank current line; decide what to do with the buffered blanks
    const currIsList = isListItem(line);
    const prevIsList = prevNonBlank !== null ? isListItem(prevNonBlank) : false;

    if (blankBuffer.length > 0) {
      if (prevIsList && currIsList) {
        // Blanks are between two list items
        if (!strictInListOnly) {
          // Merge: drop all blanks
          dropBlankBuffer();
        } else {
          // Strict: only drop if at least one is an indented blank
          const anyIndented = blankBuffer.some(isIndentedBlank);
          const hasPureEmpty = blankBuffer.some(b => b === "");
          if (anyIndented) {
            // Drop all indented blanks but preserve one pure empty if present to keep lists separated
            dropBlankBuffer();
            if (hasPureEmpty) {
              blankBuffer = [""];
              flushBlankBuffer();
            }
          } else {
            // Pure empty separator -> keep exactly one blank line to separate lists
            blankBuffer = [""];
            flushBlankBuffer();
          }
        }
      } else if (prevIsList && !currIsList) {
        // Trailing blanks after a list item before non-list content
        if (!strictInListOnly) {
          // Non-strict: drop them
          dropBlankBuffer();
        } else {
          // Strict: drop indented blanks; keep one pure empty if any
          const hasPureEmpty = blankBuffer.some(b => b === "");
          const hasIndented = blankBuffer.some(isIndentedBlank);
          if (hasIndented) {
            dropBlankBuffer();
            if (hasPureEmpty) {
              blankBuffer = [""];
              flushBlankBuffer();
            }
          } else {
            // Only pure empty -> normalize to a single empty line
            blankBuffer = [""];
            flushBlankBuffer();
          }
        }
      } else if (!prevIsList && currIsList) {
        // Blanks before a list start from non-list content: keep as-is (they separate blocks)
        flushBlankBuffer();
      } else {
        // Neither side is a list item: keep as-is
        flushBlankBuffer();
      }
    }

    // Emit current line
    out.push(line);
    prevNonBlank = line;
  }

  // End-of-document tail handling
  flushTail();

  return out.join("\n");
}

export default class RemoveListBlankLinesPlugin extends Plugin {
  settings: RemoveListBlankLinesSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "remove-blank-lines-between-list-items",
      name: "Remove blank lines between list items",
      editorCallback: (editor: Editor, ctx) => {
        if (!(ctx instanceof MarkdownView)) return;
        const view = ctx;
        const doc = editor.getValue();
        const cleaned = removeBlankLinesBetweenListItems(doc, this.settings.strictInListOnly);
        if (doc !== cleaned) {
          const cursor = editor.getCursor();
          editor.setValue(cleaned);
          editor.setCursor(cursor);
          new Notice("Removed blank lines between list items");
        } else {
          new Notice("No changes");
        }
      }
    });

    this.addSettingTab(new RemoveListBlankLinesSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class RemoveListBlankLinesSettingTab extends PluginSettingTab {
  plugin: RemoveListBlankLinesPlugin;

  constructor(app: App, plugin: RemoveListBlankLinesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    
    new Setting(containerEl)
      .setName("Cleaning Options")
      .setHeading();

    new Setting(containerEl)
      .setName("Strict In-List Only")
      .setDesc(
        "If enabled, remove only indented blank lines between list items; keep a single pure empty line to separate lists. Also remove trailing indented blanks after a list; at end-of-file no trailing blank line is kept. If disabled, remove all blanks between list items and trailing after lists."
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.strictInListOnly)
          .onChange(async (value) => {
            this.plugin.settings.strictInListOnly = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

