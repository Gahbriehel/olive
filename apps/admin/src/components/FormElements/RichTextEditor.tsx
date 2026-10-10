"use client";

import dynamic from "next/dynamic";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from "react";
import "react-quill-new/dist/quill.snow.css";
import type ReactQuillType from "react-quill-new";

import { cn } from "@/helpers/cn";
import { FormField, fieldAria, useFieldIds } from "@/components/ui/FormField";

type QuillWrapperProps = ComponentProps<typeof ReactQuillType> & {
  forwardedRef?: Ref<ReactQuillType>;
};

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const QuillWrapper = ({ forwardedRef, ...props }: QuillWrapperProps) => (
      <RQ ref={forwardedRef} {...props} />
    );
    QuillWrapper.displayName = "QuillWrapper";
    return QuillWrapper;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-xl bg-muted" />
    ),
  },
);

interface RichTextEditorProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  /** Helper text under the editor, linked via aria-describedby. */
  hint?: ReactNode;
}

export const RichTextEditor = forwardRef<ReactQuillType, RichTextEditorProps>(
  function RichTextEditor(
    {
      label,
      error,
      required,
      value,
      onChange,
      onBlur,
      placeholder,
      className,
      id: idProp,
      disabled,
      hint,
    },
    ref,
  ) {
    const { id, hintId, errorId } = useFieldIds(idProp);
    const labelId = `${id}-label`;
    const [editorRoot, setEditorRoot] = useState<HTMLElement | null>(null);

    const modules = useMemo(
      () => ({
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "clean"],
        ],
      }),
      [],
    );

    // Forward the Quill instance to the caller and keep its editable root so we
    // can wire label/hint/error to it (Quill owns that element).
    const setRefs = useCallback(
      (instance: ReactQuillType | null) => {
        if (typeof ref === "function") ref(instance);
        else if (ref) ref.current = instance;
        let root: HTMLElement | null = null;
        try {
          root = instance?.getEditor().root ?? null;
        } catch {
          root = null;
        }
        setEditorRoot(root);
      },
      [ref],
    );

    const { "aria-describedby": describedBy, "aria-invalid": invalid } =
      fieldAria({ errorId, hintId, error, hint });

    useEffect(() => {
      if (!editorRoot) return;
      const attrs: Record<string, string | undefined> = {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": label ? labelId : undefined,
        "aria-describedby": describedBy,
        "aria-invalid": invalid ? "true" : undefined,
        "aria-required": required ? "true" : undefined,
      };
      for (const [key, val] of Object.entries(attrs)) {
        if (val === undefined) editorRoot.removeAttribute(key);
        else editorRoot.setAttribute(key, val);
      }
    }, [editorRoot, id, label, labelId, required, describedBy, invalid]);

    return (
      <FormField
        id={id}
        labelId={labelId}
        label={label}
        required={required}
        hint={hint}
        error={error}
      >
        <div
          className={cn(
            "rich-text-editor-container min-h-[250px] w-full overflow-hidden rounded-xl border bg-surface transition-colors",
            "focus-within:ring-2",
            error
              ? "border-danger focus-within:border-danger focus-within:ring-danger/30"
              : "border-border focus-within:border-primary focus-within:ring-primary/30",
            disabled && "cursor-not-allowed bg-subtle opacity-60",
            className,
          )}
        >
          <ReactQuill
            forwardedRef={setRefs}
            theme="snow"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            readOnly={disabled}
            modules={modules}
            placeholder={placeholder}
            className="h-full"
          />
        </div>

        <style jsx global>{`
          /* Quill styles read the app's design tokens (globals.css), so they follow the theme. */
          .rich-text-editor-container {
            --rte-accent: var(--primary-text);
            --rte-toolbar-bg: var(--subtle);
            --rte-border: var(--border-control);
            --rte-text: var(--fg);
            --rte-muted: var(--fg-muted);
            --rte-placeholder: var(--fg-subtle);
            --rte-popover-bg: var(--surface-raised);
          }
          .rich-text-editor-container .ql-toolbar {
            border-top: none;
            border-left: none;
            border-right: none;
            border-bottom: 1px solid var(--rte-border);
            background: var(--rte-toolbar-bg);
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
          }
          .rich-text-editor-container .ql-container {
            border: none;
            font-family: inherit;
            font-size: 0.875rem;
            min-height: 200px;
          }
          .rich-text-editor-container .ql-editor {
            color: var(--rte-text);
            font-size: 0.875rem;
            padding: 16px;
            min-height: 200px;
          }
          .rich-text-editor-container .ql-editor.ql-blank::before {
            color: var(--rte-placeholder);
            font-style: normal;
            left: 16px;
          }
          .rich-text-editor-container .ql-snow .ql-stroke {
            stroke: var(--rte-muted);
          }
          .rich-text-editor-container .ql-snow .ql-fill {
            fill: var(--rte-muted);
          }
          .rich-text-editor-container .ql-snow .ql-picker {
            color: var(--rte-muted);
          }
          .rich-text-editor-container .ql-snow .ql-picker-options,
          .rich-text-editor-container .ql-snow .ql-tooltip {
            background: var(--rte-popover-bg);
            border-color: var(--rte-border);
            color: var(--rte-text);
          }
          .rich-text-editor-container .ql-snow .ql-tooltip input[type="text"] {
            background: transparent;
            border-color: var(--rte-border);
            color: var(--rte-text);
          }
          .rich-text-editor-container .ql-snow.ql-toolbar button:hover,
          .rich-text-editor-container .ql-snow.ql-toolbar button:focus,
          .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label:hover,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label.ql-active,
          .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-item:hover,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item.ql-selected {
            color: var(--rte-accent);
          }
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button:hover
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button:focus
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button.ql-active
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label:hover
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label.ql-active
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item:hover
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item.ql-selected
            .ql-stroke,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button:hover
            .ql-stroke-miter,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button:focus
            .ql-stroke-miter,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button.ql-active
            .ql-stroke-miter {
            stroke: var(--rte-accent);
          }
          .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-fill,
          .rich-text-editor-container .ql-snow.ql-toolbar button:focus .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button.ql-active
            .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item.ql-selected
            .ql-fill {
            fill: var(--rte-accent);
          }
        `}</style>
      </FormField>
    );
  },
);
