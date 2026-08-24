"use client";

import dynamic from "next/dynamic";
import { useMemo, forwardRef, type Ref, type ComponentProps } from "react";
import "react-quill-new/dist/quill.snow.css";
import { clsx } from "clsx";
import type ReactQuillType from "react-quill-new";
import { ErrorMessage } from "./ErrorMessage";

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
      <div className="h-[200px] w-full animate-pulse rounded-xl bg-gray-100" />
    ),
  }
);

interface RichTextEditorProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const RichTextEditor = forwardRef<ReactQuillType, RichTextEditorProps>(
  function RichTextEditor(
    { label, error, required, value, onChange, placeholder, className, id },
    ref
  ) {
    const modules = useMemo(
      () => ({
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "clean"],
        ],
      }),
      []
    );

    return (
      <fieldset className="relative space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-gray-600 dark:text-slate-300"
          >
            {label}&nbsp; {required && <span className="text-red-600">*</span>}
          </label>
        )}

        <div
          className={clsx(
            "rich-text-editor-container min-h-[250px] w-full overflow-hidden rounded-xl border bg-gray-50 dark:bg-slate-900 focus-within:border-primary-500 transition-all",
            error ? "border-red-500" : "border-gray-200 dark:border-slate-800",
            className
          )}
        >
          <ReactQuill
            forwardedRef={ref}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            placeholder={placeholder}
            className="h-full"
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <style jsx global>{`
          .rich-text-editor-container .ql-toolbar {
            border-top: none;
            border-left: none;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
          }
          .dark .rich-text-editor-container .ql-toolbar {
            background: #0f172a;
            border-bottom-color: #1e293b;
          }
          .rich-text-editor-container .ql-container {
            border: none;
            font-family: inherit;
            font-size: 0.875rem;
            min-height: 200px;
          }
          .rich-text-editor-container .ql-editor {
            padding: 16px;
            min-height: 200px;
          }
          .rich-text-editor-container .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
            left: 16px;
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
            color: var(--primary-color, #3b82f6);
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
            .ql-stroke-miter,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label:hover
            .ql-stroke-miter,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label.ql-active
            .ql-stroke-miter,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item:hover
            .ql-stroke-miter,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item.ql-selected
            .ql-stroke-miter {
            stroke: var(--primary-color, #3b82f6);
          }
          .rich-text-editor-container .ql-snow.ql-toolbar button:hover .ql-fill,
          .rich-text-editor-container .ql-snow.ql-toolbar button:focus .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            button.ql-active
            .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label:hover
            .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-label.ql-active
            .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item:hover
            .ql-fill,
          .rich-text-editor-container
            .ql-snow.ql-toolbar
            .ql-picker-item.ql-selected
            .ql-fill {
            fill: var(--primary-color, #3b82f6);
          }
          /* Dark mode specifics for Quill content */
          .dark .rich-text-editor-container .ql-editor {
            color: #f1f5f9;
          }
          .dark .rich-text-editor-container .ql-snow .ql-stroke {
            stroke: #94a3b8;
          }
          .dark .rich-text-editor-container .ql-snow .ql-fill {
            fill: #94a3b8;
          }
          .dark .rich-text-editor-container .ql-snow .ql-picker {
            color: #94a3b8;
          }
        `}</style>
      </fieldset>
    );
  }
);
