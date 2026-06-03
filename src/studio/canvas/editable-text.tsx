"use client";
import * as React from "react";

// A contenteditable surface that mirrors a plain-string value. In multiline
// mode newlines map to <br>; single-line mode strips them. We only push the
// DOM back into `value` when the element isn't focused so typing isn't fought.
export function EditableText({
  value,
  editable,
  onChange,
  onFocus,
  style,
  multiline = false,
  placeholder,
}: {
  value: string;
  editable?: boolean;
  onChange?: (next: string) => void;
  onFocus?: () => void;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const incoming = multiline ? value.replace(/\n/g, "<br/>") : value;
    if (node.innerHTML !== incoming && document.activeElement !== node) {
      node.innerHTML = incoming || "";
    }
  }, [value, multiline]);

  const emit = (event: React.FormEvent<HTMLDivElement>) => {
    if (!onChange) return;
    const text = (event.currentTarget.innerHTML || "")
      .replace(/<div>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    onChange(multiline ? text : text.replace(/\n/g, ""));
  };

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={emit}
      onFocus={() => onFocus?.()}
      onMouseDown={(e) => {
        // Let the user click into the text without arming a drag.
        if (editable) {
          e.stopPropagation();
          onFocus?.();
        }
      }}
      onPointerDown={(e) => {
        if (editable) e.stopPropagation();
      }}
      style={{
        outline: "none",
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        cursor: editable ? "text" : "default",
        ...style,
      }}
    />
  );
}
