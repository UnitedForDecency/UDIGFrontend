
import React, { useCallback, useState, type ChangeEvent, type MouseEvent, type FC, useRef, useEffect } from "react";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer  } from "@tiptap/react";
import { Node, mergeAttributes, type NodeViewProps, type RawCommands, Mark } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Undo2, Redo2, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, Code, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Code2, Minus, Link2,
  FolderOpen,
  SuperscriptIcon,
  SubscriptIcon,
  IndentIcon,
  OutdentIcon, 
} from "lucide-react";
import {Image as ImageIcon} from 'lucide-react'
import type { Transaction, EditorState  } from "@tiptap/pm/state";


// ─────────────────────────────────────────────
// 🎨 THEME — edit here to restyle everything
// ─────────────────────────────────────────────
const THEME = {
    // Layout
    editorMaxWidth: "940px",
    editorMinHeight: "420px",
    editorBorderRadius: "12px",
    editorBorder: "1px solid #e2e8f0",
    editorBoxShadow: "0 4px 24px rgba(0,0,0,0.07)",

    // Toolbar
    toolbarBg: "#ffffff",
    toolbarBorderBottom: "1px solid #e2e8f0",
    toolbarPadding: "8px 12px",
    toolbarGap: "2px",

    // Toolbar buttons
    btnSize: "34px",
    btnBorderRadius: "7px",
    btnColor: "#374151",
    btnHoverBg: "#f1f5f9",
    btnActiveBg: "#e0f2fe",
    btnActiveColor: "#0284c7",
    btnFontSize: "14px",

    // Editor content area
    contentBg: "#ffffff",
    contentPadding: "32px 40px",
    contentFontFamily: "'Georgia', serif",
    contentFontSize: "17px",
    contentLineHeight: "1.8",
    contentColor: "#1e293b",
    placeholderColor: "#94a3b8",

    // Divider between toolbar groups
    dividerColor: "#e2e8f0",

    // Modal overlay
    modalOverlayBg: "rgba(15,23,42,0.55)",
    modalBg: "#ffffff",
    modalBorderRadius: "14px",
    modalBoxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    modalPadding: "28px",

    // Inline bubble menu
    bubbleBg: "#1e293b",
    bubbleColor: "#f8fafc",
    bubbleBtnActiveBg: "#334155",
} as const;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ModalType = "image" | "video" | "link";

interface FieldDef {
    name: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    type?: string;
    autoFocus?: boolean;
}

type FieldValues = Record<string, string>;

interface ModalProps {
    title: string;
    fields: FieldDef[];
    onConfirm: (values: FieldValues) => void;
    onClose: () => void;
}

interface BtnProps {
    icon: React.ReactNode;
    title?: string;
    active?: boolean;
    onClick: () => void;
}

export interface RichTextEditorProps {
    /** Initial HTML content */
    content?: string;
    /** Called with the latest HTML string on every editor change */
    onChange?: (html: string) => void;
    /** Placeholder text shown when the editor is empty */
    placeholder?: string;
}

// ─────────────────────────────────────────────
// Inline CSS helper
// ─────────────────────────────────────────────
const css = (strings: TemplateStringsArray, ...values: string[]): string =>
    strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");

// Inject global styles once
const GLOBAL_STYLE = css`
  .rte-content .ProseMirror::after {
    content: "";
    display: table;
    clear: both;
  }
  .rte-wrapper * { box-sizing: border-box; }
  .rte-content .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.6em;
  }

  .rte-content .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.6em;
  }

  .rte-content .ProseMirror li {
    display: list-item;
  }
  .rte-toolbar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${THEME.btnSize};
    height: ${THEME.btnSize};
    border: none;
    background: transparent;
    color: ${THEME.btnColor};
    border-radius: ${THEME.btnBorderRadius};
    font-size: ${THEME.btnFontSize};
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    padding: 0;
    font-family: inherit;
  }
  .rte-toolbar button:hover { background: ${THEME.btnHoverBg}; }
  .rte-toolbar button.is-active {
    background: ${THEME.btnActiveBg};
    color: ${THEME.btnActiveColor};
  }

  /* ProseMirror content styles */
  .rte-content .ProseMirror {
    text-align: left;
    max-height: 600px;
    overflow-y: auto;
    outline: none;
    min-height: ${THEME.editorMinHeight};
    padding: ${THEME.contentPadding};
    font-family: ${THEME.contentFontFamily};
    font-size: ${THEME.contentFontSize};
    line-height: ${THEME.contentLineHeight};
    color: ${THEME.contentColor};
    background: ${THEME.contentBg};
    border-radius: 0 0 ${THEME.editorBorderRadius} ${THEME.editorBorderRadius};
  }
  .rte-content .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: ${THEME.placeholderColor};
    pointer-events: none;
    float: left;
    height: 0;
  }
  .rte-content .ProseMirror h1 { font-size: 2em; margin: 0.6em 0 0.3em; line-height: 1.2; }
  .rte-content .ProseMirror h2 { font-size: 1.5em; margin: 0.6em 0 0.3em; line-height: 1.3; }
  .rte-content .ProseMirror h3 { font-size: 1.25em; margin: 0.5em 0 0.25em; }
  .rte-content .ProseMirror blockquote {
    border-left: 4px solid #cbd5e1;
    margin: 1em 0;
    padding: 0.5em 1.2em;
    color: #64748b;
    font-style: italic;
  }
  .rte-content .ProseMirror pre {
    background: #f1f5f9;
    border-radius: 8px;
    padding: 1em 1.2em;
    font-family: 'Fira Mono', monospace;
    font-size: 0.9em;
    overflow-x: auto;
  }
  .rte-content .ProseMirror img {
    max-width: 100%;
    border-radius: 8px;
    display: block;
    margin: 1em auto;
    cursor: pointer;
  }
  .rte-content .ProseMirror img.ProseMirror-selectednode {
    outline: 3px solid ${THEME.btnActiveColor};
  }
  .rte-content .ProseMirror iframe {
    max-width: 100%;
    border-radius: 8px;
    display: block;
    margin: 1em auto;
  }
  .rte-content .ProseMirror a { color: #0284c7; text-decoration: underline; }
  .rte-content .ProseMirror ul, .rte-content .ProseMirror ol { padding-left: 1.6em; }
  .rte-content .ProseMirror li { margin: 0.25em 0; }
  .rte-content .ProseMirror hr { border: none; border-top: 2px solid #e2e8f0; margin: 2em 0; }

  /* Bubble menu */
  .rte-bubble {
    display: flex;
    gap: 2px;
    background: ${THEME.bubbleBg};
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  }
  .rte-bubble button {
    width: 30px; height: 30px;
    border: none; background: transparent;
    color: ${THEME.bubbleColor};
    border-radius: 5px;
    font-size: 13px; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    transition: background 0.12s;
  }
  .rte-bubble button:hover, .rte-bubble button.is-active { background: ${THEME.bubbleBtnActiveBg}; }

  /* Modal */
  .rte-modal-overlay {
    position: fixed; inset: 0;
    background: ${THEME.modalOverlayBg};
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    animation: rte-fade-in 0.15s ease;
  }
  .rte-modal {
    background: ${THEME.modalBg};
    border-radius: ${THEME.modalBorderRadius};
    box-shadow: ${THEME.modalBoxShadow};
    padding: ${THEME.modalPadding};
    width: 100%;
    max-width: 440px;
    animation: rte-slide-up 0.18s ease;
  }
  .rte-modal h3 { margin: 0 0 18px; font-size: 1.1em; color: #1e293b; }
  .rte-modal label { display: block; font-size: 13px; color: #475569; margin-bottom: 5px; }
  .rte-modal input {
    width: 100%; padding: 9px 12px;
    border: 1px solid #cbd5e1; border-radius: 8px;
    font-size: 14px; color: #1e293b;
    outline: none; margin-bottom: 14px;
    transition: border-color 0.15s;
  }
  .rte-modal input:focus { border-color: #0284c7; }
  .rte-modal .rte-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
  .rte-modal .rte-btn-cancel {
    padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
    background: transparent; cursor: pointer; font-size: 14px; color: #64748b;
  }
  .rte-modal .rte-btn-confirm {
    padding: 8px 18px; border: none; border-radius: 8px;
    background: #0284c7; color: #fff; cursor: pointer; font-size: 14px; font-weight: 600;
    transition: background 0.15s;
  }
  .rte-modal .rte-btn-confirm:hover { background: #0369a1; }

  @keyframes rte-fade-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes rte-slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

  .rte-image-wrapper {
  display: block;
  position: relative;
  margin: 1em auto;
  line-height: 0;
  max-width: 100%;
}
.rte-content .ProseMirror p,
.rte-content .ProseMirror li {
  white-space: pre-wrap;
  tab-size: 8;
}
.rte-image-wrapper img {
  display: block;
  border-radius: 8px;
  width: 100%;
  height: auto;
  margin: 0 !important;
}
.rte-image-wrapper.is-selected img {
  outline: 3px solid #0284c7;
  border-radius: 8px;
}
.rte-resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #0284c7;
  border: 2px solid #fff;
  border-radius: 2px;
  z-index: 10;
}
.rte-resize-handle.nw { top: -5px;    left: -5px;   cursor: nw-resize; }
.rte-resize-handle.ne { top: -5px;    right: -5px;  cursor: ne-resize; }
.rte-resize-handle.sw { bottom: -5px; left: -5px;   cursor: sw-resize; }
.rte-resize-handle.se { bottom: -5px; right: -5px;  cursor: se-resize; }
`;

// Inject once into <head>
if (typeof document !== "undefined" && !document.getElementById("rte-styles")) {
    const style = document.createElement("style");
    style.id = "rte-styles";
    style.textContent = GLOBAL_STYLE;
    document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// Modal component
// ─────────────────────────────────────────────
const Modal: FC<ModalProps> = ({ title, fields, onConfirm, onClose }) => {
    const [values, setValues] = useState<FieldValues>(() =>
        Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]))
    );

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="rte-modal-overlay" onClick={handleOverlayClick}>
            <div className="rte-modal">
                <h3>{title}</h3>
                {fields.map((f) => (
                    <div key={f.name}>
                        <label>{f.label}</label>
                        <input
                            type={f.type ?? "text"}
                            placeholder={f.placeholder ?? ""}
                            value={values[f.name]}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setValues((v) => ({ ...v, [f.name]: e.target.value }))
                            }
                            autoFocus={f.autoFocus}
                        />
                    </div>
                ))}
                <div className="rte-modal-actions">
                    <button className="rte-btn-cancel" onClick={onClose} type="button">
                        Cancel
                    </button>
                    <button className="rte-btn-confirm" onClick={() => onConfirm(values)} type="button">
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Toolbar button
// ─────────────────────────────────────────────
const Btn: FC<BtnProps> = ({ icon, active, onClick, title }) => (
    <button
        type="button"
        className={active ? "is-active" : ""}
        onClick={onClick}
        title={title}
    >
        {icon}
    </button>
);

const Divider: FC = () => (
    <div
        style={{
            width: 1,
            height: 22,
            background: THEME.dividerColor,
            margin: "0 4px",
            alignSelf: "center",
        }}
    />
);

// ─────────────────────────────────────────────
// Indent Extension
// ─────────────────────────────────────────────
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
    videoEmbed: {
      insertVideoEmbed: (attrs: { src: string; width?: string; height?: string }) => ReturnType;
    };
  }
}

const INDENT_SIZE = 40;
const MAX_INDENT = 320;

const Indent = Mark.create({
  name: "indent",

  addOptions() {
    return {
      indentSize: INDENT_SIZE,
      maxIndent: MAX_INDENT,
    };
  },

  addAttributes() {
    return {
      level: {
        default: INDENT_SIZE,
        parseHTML: (el) =>
          parseInt((el as HTMLElement).style.paddingLeft ?? String(INDENT_SIZE), 10),
        renderHTML: (attrs) => ({
          style: `padding-left: ${attrs.level as number}px`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[style*='padding-left']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ state, dispatch, tr }: {
          state: EditorState;
          dispatch: ((tr: Transaction) => void) | undefined;
          tr: Transaction;
        }) => {
          const { from, to, empty } = state.selection;

          // No selection — insert a tab character at the cursor
          if (empty) {
            tr.insertText("\t", from);
            if (dispatch) dispatch(tr);
            return true;
          }

          // Selection — wrap selected text in indent mark as before
          const existingMark = state.doc
            .resolve(from)
            .marks()
            .find((m) => m.type.name === "indent");
          const currentLevel = (existingMark?.attrs.level as number) ?? 0;
          const nextLevel = Math.min(currentLevel + INDENT_SIZE, MAX_INDENT);
          const mark = state.schema.marks.indent.create({ level: nextLevel });
          tr.addMark(from, to, mark);
          if (dispatch) dispatch(tr);
          return true;
        },

      outdent:
        () =>
        ({ state, dispatch, tr }: {
          state: EditorState;
          dispatch: ((tr: Transaction) => void) | undefined;
          tr: Transaction;
        }) => {
          const { from, to, empty } = state.selection;

          if (empty) {
            const currentMark = (state.storedMarks ?? state.doc.resolve(from).marks())
              .find((m) => m.type.name === "indent");
            if (!currentMark) return false;
            const currentLevel = currentMark.attrs.level as number;
            const nextLevel = currentLevel - INDENT_SIZE;
            if (nextLevel <= 0) {
              tr.removeStoredMark(state.schema.marks.indent);
            } else {
              tr.addStoredMark(
                state.schema.marks.indent.create({ level: nextLevel })
              );
            }
            if (dispatch) dispatch(tr);
            return true;
          }

          const existingMark = state.doc
            .resolve(from)
            .marks()
            .find((m) => m.type.name === "indent");
          const currentLevel = (existingMark?.attrs.level as number) ?? 0;
          const nextLevel = currentLevel - INDENT_SIZE;
          if (nextLevel <= 0) {
            tr.removeMark(from, to, state.schema.marks.indent);
          } else {
            tr.addMark(
              from,
              to,
              state.schema.marks.indent.create({ level: nextLevel })
            );
          }
          if (dispatch) dispatch(tr);
          return true;
        },
    } as unknown as Partial<RawCommands>;
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      "Shift-Tab": () => this.editor.commands.outdent(),
    };
  },
});

// ─────────────────────────────────────────────
// Video Embed
// ─────────────────────────────────────────────
const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:    { default: null },
      width:  { default: "640" },
      height: { default: "360" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video-embed] iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { "data-video-embed": "" },
      [
        "iframe",
        mergeAttributes(
          {
            width:           HTMLAttributes.width,
            height:          HTMLAttributes.height,
            src:             HTMLAttributes.src,
            frameborder:     "0",
            allowfullscreen: "true",
            style:           "border-radius:8px;display:block;margin:1em auto;max-width:100%;",
          }
        ),
      ],
    ];
  },

  addCommands() {
    return {
      insertVideoEmbed:
        (attrs: { src: string; width?: string; height?: string }) =>
        ({ commands }: { commands: { insertContent: (c: unknown) => boolean } }) =>
          commands.insertContent({ type: "videoEmbed", attrs }),
    } as unknown as Partial<RawCommands>;
  },
});

const resolveEmbedUrl = (input: string): string | null => {
  const trim = input.trim();

  // Already an iframe — extract the src
  const iframeSrcMatch = trim.match(/src=["']([^"']+)["']/);
  if (iframeSrcMatch) return iframeSrcMatch[1];

  // YouTube
  // https://www.youtube.com/watch?v=ID or https://youtu.be/ID
  const yt = trim.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo
  // https://vimeo.com/123456789
  const vimeo = trim.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  // Twitch stream
  // https://www.twitch.tv/channelname
  const twitchStream = trim.match(/twitch\.tv\/([a-zA-Z0-9_]+)(?!\/)$/);
  if (twitchStream)
    return `https://player.twitch.tv/?channel=${twitchStream[1]}&parent=${window.location.hostname}`;

  // Twitch clip
  // https://www.twitch.tv/videos/123456789
  const twitchVod = trim.match(/twitch\.tv\/videos\/(\d+)/);
  if (twitchVod)
    return `https://player.twitch.tv/?video=${twitchVod[1]}&parent=${window.location.hostname}`;

  // Dailymotion
  // https://www.dailymotion.com/video/ID
  const dm = trim.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dm) return `https://www.dailymotion.com/embed/video/${dm[1]}`;

  // Facebook video
  // Facebook requires their JS SDK for direct URLs, so we use their
  // universal embed endpoint instead
  if (trim.includes("facebook.com") || trim.includes("fb.watch")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trim)}&show_text=false`;
  }

  const spotify = trim.match(
    /open\.spotify\.com\/(track|album|playlist|episode|artist|show)\/([a-zA-Z0-9]+)/
  );
  if (spotify) {
    return `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`;
  }

  // Raw iframe — return as-is if nothing matched but it looks like a URL
  if (trim.startsWith("http")) return trim;

  return null;
};

// ─────────────────────────────────────────────
// Resizeable Image
// ─────────────────────────────────────────────
const ResizableImageView: FC<NodeViewProps> = ({ node, updateAttributes, selected }) => {
  const src     = node.attrs.src as string;
  const alt     = node.attrs.alt as string | undefined;
  const width   = node.attrs.width as number | undefined;
  const align   = (node.attrs.align as string) ?? "none";

  const startX  = useRef<number>(0);
  const startW  = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef  = useRef<HTMLImageElement>(null);

  const startResize = (e: React.MouseEvent, corner: string): void => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startW.current = imgRef.current?.offsetWidth ?? (width ?? 300);

    const onMouseMove = (ev: globalThis.MouseEvent): void => {
      const dx = ev.clientX - startX.current;
      const sign = corner === "nw" || corner === "sw" ? -1 : 1;
      const maxW = wrapperRef.current?.parentElement?.offsetWidth ?? Infinity;
      const newW = Math.min(maxW, Math.max(80, Math.round(startW.current + sign * dx)));
      updateAttributes({ width: newW });
    };

    const onMouseUp = (): void => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const wrapperStyle: React.CSSProperties =
    align === "left"
      ? { float: "left", margin: "0 1.5em 1em 0", width: width ? `${width}px` : undefined }
      : align === "right"
      ? { float: "right", margin: "0 0 1em 1.5em", width: width ? `${width}px` : undefined }
      : { display: "block", margin: "1em auto", width: width ? `${width}px` : undefined };

  return (
    <NodeViewWrapper as="div" style={{ display: align === "none" ? "block" : "contents" }}>
      <div
        ref={wrapperRef}
        className={`rte-image-wrapper${selected ? " is-selected" : ""}`}
        style={wrapperStyle}
      >
        <img ref={imgRef} src={src} alt={alt ?? ""} draggable={false} />

        {/* Alignment controls — only visible when selected */}
        {selected && (
          <div style={{
            position: "absolute",
            top: -36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 4,
            background: "#1e293b",
            borderRadius: 7,
            padding: "3px 5px",
            zIndex: 20,
          }}>
            {(["left", "none", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                title={a === "none" ? "Center" : `Float ${a}`}
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: a }); }}
                style={{
                  width: 26, height: 26,
                  border: "none",
                  borderRadius: 5,
                  background: align === a ? "#334155" : "transparent",
                  color: "#f8fafc",
                  cursor: "pointer",
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {a === "left" ? "◧" : a === "right" ? "◨" : "▣"}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <>
            <span className="rte-resize-handle nw" onMouseDown={(e) => startResize(e, "nw")} />
            <span className="rte-resize-handle ne" onMouseDown={(e) => startResize(e, "ne")} />
            <span className="rte-resize-handle sw" onMouseDown={(e) => startResize(e, "sw")} />
            <span className="rte-resize-handle se" onMouseDown={(e) => startResize(e, "se")} />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:   { default: null },
      alt:   { default: "" },
      width: { default: null },
      align:  { default: "none" },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
  const style = HTMLAttributes.align === "left"
    ? "float:left; margin: 0 1.5em 1em 0;"
    : HTMLAttributes.align === "right"
    ? "float:right; margin: 0 0 1em 1.5em;"
    : "display:block; margin: 1em auto;";
  return ["img", mergeAttributes(HTMLAttributes, { style })];
},

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  addCommands() {
  return {
    setResizableImage:
      (attrs: { src: string; alt?: string }) =>
      ({ commands }: { commands: Pick<RawCommands, "insertContent"> }) =>
        commands.insertContent({ type: this.name, attrs }),
  } as Partial<RawCommands>;
},
});

const insertResizableImage = (
  editor: ReturnType<typeof useEditor>,
  attrs: { src: string; alt: string }
): void => {
  (editor?.commands as unknown as { setResizableImage: typeof attrs extends infer A ? (a: A) => void : never })
    .setResizableImage(attrs);
};



// ─────────────────────────────────────────────
// FloatingToolbar — appears above text selections
// ─────────────────────────────────────────────
interface FloatingToolbarProps {
  editor: ReturnType<typeof useEditor>;
  onLinkClick: () => void;
}

const FloatingToolbar: FC<FloatingToolbarProps> = ({ editor, onLinkClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!editor) return;

    const update = (): void => {
        const { empty } = editor.state.selection;
        if (empty) {
            setPos(null);
            return;
        }

        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
            setPos(null);
            return;
        }

        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width === 0) {
            setPos(null);
            return;
        }

        const menuWidth = 180;
        const left = Math.min(
            Math.max(rect.left + rect.width / 2 - menuWidth / 2, 8),
            window.innerWidth - menuWidth - 8
        );
        const top = rect.top - 46;

        setPos({ top, left });
        };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  if (!editor || !pos) return null;

  return (
    <div
      ref={ref}
      className="rte-bubble"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 50,
        pointerEvents: "auto",
      }}
      // Prevent the toolbar clicks from collapsing the selection
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        className={editor.isActive("bold") ? "is-active" : ""}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
        type="button"
      >
        <b>B</b>
      </button>
      <button
        className={editor.isActive("italic") ? "is-active" : ""}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
        type="button"
      >
        <i>I</i>
      </button>
      <button
        className={editor.isActive("underline") ? "is-active" : ""}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
        type="button"
      >
        <u>U</u>
      </button>
      <button
        className={editor.isActive("link") ? "is-active" : ""}
        onClick={onLinkClick}
        title="Link"
        type="button"
      >
        🔗
      </button>
      <button
        className={editor.isActive("strike") ? "is-active" : ""}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strike"
        type="button"
      >
        <s>S</s>
      </button>
    </div>
  );
};  

// ─────────────────────────────────────────────
// Main Editor
// ─────────────────────────────────────────────
const RichTextEditor: FC<RichTextEditorProps> = ({
    content = "",
    onChange,
    placeholder = "Start writing your story…",
}) => {
    const [modal, setModal] = useState<ModalType | null>(null);
    const [, forceUpdate] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Superscript,
            Subscript,
            ResizableImage,
            Indent,
            Link.configure({ openOnClick: false, autolink: true }),
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            VideoEmbed,
            // Youtube.configure({ width: 640, height: 360, nocookie: true }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        onTransaction: () => {
          forceUpdate((n) => n + 1);
        },
        onSelectionUpdate: () => {
          forceUpdate((n) => n + 1);
        },
    });

    const openModal = useCallback((type: ModalType): void => setModal(type), []);
    const closeModal = useCallback((): void => setModal(null), []);

    const handleImageInsert = ({ url, alt }: FieldValues): void => {
        if (url) insertResizableImage(editor, { src: url, alt: alt ?? "" });
        closeModal();
    };

    const handleImageUpload = useCallback(
        (e: ChangeEvent<HTMLInputElement>): void => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;
            const reader = new FileReader();
            reader.onload = (ev: ProgressEvent<FileReader>) => {
                const result = ev.target?.result;
                if (typeof result === "string") {
                    insertResizableImage(editor, { src: result, alt: file.name });
                }
            };
            reader.readAsDataURL(file);
            e.target.value = "";
        },
        [editor]
    );

    const handleVideoInsert = ({ src, width, height }: FieldValues): void => {
      const resolvedSrc = resolveEmbedUrl(src);
      if (resolvedSrc) {
        editor?.commands.insertVideoEmbed({
          src: resolvedSrc,
          width: width || "640",
          height: height || "360",
        });
      }
      closeModal();
    };

    const handleLinkInsert = ({ url }: FieldValues): void => {
        if (url) {
            editor
                ?.chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url.startsWith("http") ? url : `https://${url}` })
                .run();
        } else {
            editor?.chain().focus().unsetLink().run();
        }
        closeModal();
    };

    if (!editor) return null;

    return (
        <div
            className="rte-wrapper"
            style={{
                maxWidth: THEME.editorMaxWidth,
                border: THEME.editorBorder,
                borderRadius: THEME.editorBorderRadius,
                boxShadow: THEME.editorBoxShadow,
                overflow: "hidden",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            {/* ── Toolbar ── */}
            <div
                className="rte-toolbar"
                style={{
                    background: THEME.toolbarBg,
                    borderBottom: THEME.toolbarBorderBottom,
                    padding: THEME.toolbarPadding,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: THEME.toolbarGap,
                    alignItems: "center",
                }}
            >
                {/* History */}
                <Btn icon={<Undo2 size={16} />} title="Undo" onClick={() => editor.chain().focus().undo().run()} />
                <Btn icon={<Redo2 size={16} />} title="Redo" onClick={() => editor.chain().focus().redo().run()} />
                <Divider />

                {/* Headings */}
                <Btn icon={<span style={{fontSize:12,fontWeight:700}}>H1</span>} active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
                <Btn icon={<span style={{fontSize:12,fontWeight:700}}>H2</span>} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
                <Btn icon={<span style={{fontSize:12,fontWeight:700}}>H3</span>} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
                <Divider />

                {/* Inline formatting */}
                <Btn icon={<Bold size={16} />} title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
                <Btn icon={<Italic size={16} />} title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
                <Btn icon={<UnderlineIcon size={16} />} title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
                <Btn icon={<Strikethrough size={16} />} title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
                <Btn icon={<Code size={16} />} title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
                <Divider />

                {/* Text alignment */}
                <Btn icon={<AlignLeft size={16} />} title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
                <Btn icon={<AlignCenter size={16} />} title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
                <Btn icon={<AlignRight size={16} />} title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
                <Btn icon={<IndentIcon size={16}/>} title="Indent" onClick={() => editor.chain().focus().indent().run()} />
                <Btn icon={<OutdentIcon size={16}/>} title="Outdent" onClick={() => editor.chain().focus().outdent().run()} />
                <Divider />

                {/* Lists */}
                <Btn icon={<List size={16} />} title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
                <Btn icon={<ListOrdered size={16} />} title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
                <Btn icon={<SuperscriptIcon size={16}/>} title="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} />
                <Btn icon={<SubscriptIcon size={16}/>} title="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} />
                <Divider />

                {/* Blocks */}
                <Btn icon={<Quote size={16} />} title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
                <Btn icon={<Code2 size={16} />} title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
                <Btn icon={<Minus size={16} />} title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
                <Divider />

                {/* Link */}
                <Btn icon={<Link2 size={16} />} title="Insert link" active={editor.isActive("link")} onClick={() => openModal("link")} />

                {/* Image URL */}
                <Btn icon={<ImageIcon size={16} />} title="Embed image from URL" onClick={() => openModal("image")} />

                {/* Image upload */}
                <label
                    title="Upload image from device"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: THEME.btnSize,
                        height: THEME.btnSize,
                        borderRadius: THEME.btnBorderRadius,
                        cursor: "pointer",
                        fontSize: THEME.btnFontSize,
                        color: THEME.btnColor,
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={(e: MouseEvent<HTMLLabelElement>) =>
                        (e.currentTarget.style.background = THEME.btnHoverBg)
                    }
                    onMouseLeave={(e: MouseEvent<HTMLLabelElement>) =>
                        (e.currentTarget.style.background = "transparent")
                    }
                >
                    <FolderOpen size={16} />
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                    />
                </label>

                {/* YouTube / Video */}
                <Btn icon="▶" title="Embed YouTube video" onClick={() => openModal("video")} />
            </div>

            {/* ── Bubble menu (selected text) ── */}
            <FloatingToolbar editor={editor} onLinkClick={() => openModal("link")} />

            {/* ── Editor content ── */}
            <div className="rte-content">
                <EditorContent editor={editor} />
            </div>

            {/* ── Modals ── */}
            {modal === "image" && (
                <Modal
                    title="Insert Image"
                    fields={[
                        {
                            name: "url",
                            label: "Image URL",
                            placeholder: "https://example.com/image.jpg",
                            autoFocus: true,
                        },
                        {
                            name: "alt",
                            label: "Alt text (optional)",
                            placeholder: "Describe the image…",
                        },
                    ]}
                    onConfirm={handleImageInsert}
                    onClose={closeModal}
                />
            )}
            {modal === "video" && (
              <Modal
                title="Embed Video"
                fields={[
                  {
                    name: "src",
                    label: "Video URL or iframe embed code",
                    placeholder: "YouTube, Vimeo, Facebook, Twitch, Dailymotion…",
                    autoFocus: true,
                  },
                  { name: "width",  label: "Width (px)",  placeholder: "640", defaultValue: "640" },
                  { name: "height", label: "Height (px)", placeholder: "360", defaultValue: "360" },
                ]}
                onConfirm={handleVideoInsert}
                onClose={closeModal}
              />
            )}
            {modal === "link" && (
                <Modal
                    title="Insert Link"
                    fields={[
                        {
                            name: "url",
                            label: "URL",
                            placeholder: "https://example.com",
                            autoFocus: true,
                            defaultValue: (editor.getAttributes("link").href as string | undefined) ?? "",
                        },
                    ]}
                    onConfirm={handleLinkInsert}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default RichTextEditor;