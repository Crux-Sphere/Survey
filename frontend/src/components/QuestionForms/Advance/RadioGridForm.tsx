"use client";

import { useEffect, useState } from "react";
import FormHeader from "../FormHeader";
import { FormProps } from "@/types/forms_interfaces";
import { useWatch } from "react-hook-form";
import { IoAdd, IoClose } from "react-icons/io5";
import {
  parseMatrixOptions,
  toMatrixOptionObjects,
} from "@/utils/matrixOptions";

const COLUMN_PRESETS = [
  {
    label: "बढ़ी / घटी / कोई बदलाव नहीं",
    values: ["बढ़ी", "घटी", "कोई बदलाव नहीं"],
  },
  {
    label: "सहमत / असहमत / तटस्थ",
    values: ["सहमत", "असहमत", "तटस्थ"],
  },
  {
    label: "हाँ / नहीं / कह नहीं सकते",
    values: ["हाँ", "नहीं", "कह नहीं सकते"],
  },
  {
    label: "अच्छा / औसत / खराब",
    values: ["अच्छा", "औसत", "खराब"],
  },
  {
    label: "बहुत अच्छा → बहुत खराब",
    values: ["बहुत अच्छा", "अच्छा", "औसत", "खराब", "बहुत खराब"],
  },
  {
    label: "पूरी तरह सहमत → असहमत",
    values: [
      "पूरी तरह सहमत",
      "सहमत",
      "न सहमत न असहमत",
      "असहमत",
      "पूरी तरह असहमत",
    ],
  },
];

function OptionListEditor({
  label,
  hint,
  items,
  placeholder,
  addLabel,
  onChange,
}: {
  label: string;
  hint: string;
  items: string[];
  placeholder: string;
  addLabel: string;
  onChange: (next: string[]) => void;
}) {
  function updateAt(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }

  function removeAt(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-[#111827]">{label}</label>
        <span className="text-xs text-[#6b7280]">{hint}</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-sm text-secondary-300 italic py-2">
            No items yet — click &quot;{addLabel}&quot; below.
          </p>
        )}
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-secondary-300 w-6 shrink-0 text-right">
              {i + 1}.
            </span>
            <input
              type="text"
              value={item}
              maxLength={100}
              onChange={(e) => updateAt(i, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className="flex-1 border border-secondary-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-300"
            />
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => removeAt(i)}
              className="p-2 text-secondary-300 hover:text-red-500 shrink-0"
              title="Remove"
            >
              <IoClose size={18} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={addItem}
        className="self-start flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 mt-1"
      >
        <IoAdd size={16} />
        {addLabel}
      </button>
    </div>
  );
}

function RadioGridForm({
  id,
  index,
  register,
  setValue,
  handleHide,
  control,
  hide,
  handleDelete,
  handleDuplicate,
  handleDragStart,
  handleDragEnter,
  endIndex,
  defaultQuestionTitle,
}: FormProps) {
  const rowOptionsRaw = useWatch({
    control,
    name: `questions.${index}.parameters.row_options`,
  });
  const columnOptionsRaw = useWatch({
    control,
    name: `questions.${index}.parameters.column_options`,
  });
  const questionTitle = useWatch({
    control,
    name: `questions.${index}.parameters.question`,
  });

  const [rows, setRows] = useState<string[]>(() =>
    parseMatrixOptions(rowOptionsRaw)
  );
  const [cols, setCols] = useState<string[]>(() =>
    parseMatrixOptions(columnOptionsRaw)
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  function persistRows(next: string[]) {
    setRows(next);
    const saved = toMatrixOptionObjects(next);
    setValue?.(`questions.${index}.parameters.row_options`, saved, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  function persistCols(next: string[]) {
    setCols(next);
    const saved = toMatrixOptionObjects(next);
    setValue?.(`questions.${index}.parameters.column_options`, saved, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  function applyPreset(values: string[]) {
    persistCols(values);
  }

  // Sync from form on load — but don't wipe empty rows the user is still typing
  useEffect(() => {
    const fromForm = parseMatrixOptions(rowOptionsRaw);
    setRows((prev) => {
      const prevFilled = prev.map((s) => s.trim()).filter(Boolean);
      if (prevFilled.join("\n") === fromForm.join("\n")) return prev;
      return fromForm.length ? fromForm : [""];
    });
  }, [rowOptionsRaw]);

  useEffect(() => {
    const fromForm = parseMatrixOptions(columnOptionsRaw);
    setCols((prev) => {
      const prevFilled = prev.map((s) => s.trim()).filter(Boolean);
      if (prevFilled.join("\n") === fromForm.join("\n")) return prev;
      return fromForm.length ? fromForm : [""];
    });
  }, [columnOptionsRaw]);

  const previewRows = rows.map((r) => r.trim()).filter(Boolean);
  const previewCols = cols.map((c) => c.trim()).filter(Boolean);
  const showPreview = previewRows.length > 0 && previewCols.length > 0;

  return (
    <div
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      draggable
      className={`flex justify-center items-center flex-col gap-2 border border-secondary-200 rounded-md overflow-hidden cursor-move ${endIndex?.toString() === id ? "border-2 border-blue-500" : ""}`}
    >
      <FormHeader
        handleDelete={handleDelete}
        handleDuplicate={handleDuplicate}
        register={register}
        id={id}
        index={index}
        input={true}
        hide={hide}
        handleHide={handleHide}
        defaultQuestionTitle={defaultQuestionTitle}
        control={control}
      />
      {!hide && (
        <div
          className="bg-[#f4f6f8] p-4 w-full cursor-default"
          onMouseDown={(e) => e.stopPropagation()}
          draggable={false}
        >
          <div className="flex flex-col gap-4 bg-white w-full rounded-md border border-secondary-200 p-4">
            <p className="text-sm text-[#4b5563]">
              Build a grid: topics as rows, shared answers as columns. Each row
              gets one radio choice.
            </p>

            {/* Live preview — high contrast so Hindi/English text is clearly visible */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#111827]">
                  Live preview
                </h4>
                {!showPreview && (
                  <span className="text-xs text-amber-700 font-medium">
                    Add at least 1 topic and 1 answer to see the grid
                  </span>
                )}
              </div>
              <div className="border-2 border-[#d1d5db] rounded-md overflow-x-auto bg-white min-h-[100px] shadow-sm">
                {showPreview ? (
                  <>
                    <p className="px-4 py-3 text-[15px] font-semibold text-[#111827] border-b-2 border-[#e5e7eb] bg-[#fff7ed] leading-relaxed">
                      {questionTitle?.trim() ||
                        "Type your question above…"}
                      <span className="text-red-600"> *</span>
                    </p>
                    <table className="w-full text-[14px] border-collapse">
                      <thead>
                        <tr className="bg-[#ffedd5]">
                          <th className="text-left px-4 py-3 font-semibold text-[#374151] min-w-[160px] border-b border-[#e5e7eb]" />
                          {previewCols.map((col, ci) => (
                            <th
                              key={`${col}-${ci}`}
                              className="px-4 py-3 font-bold text-[#111827] text-center whitespace-nowrap border-b border-[#e5e7eb]"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, rowIdx) => (
                          <tr
                            key={`${row}-${rowIdx}`}
                            className={
                              rowIdx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"
                            }
                          >
                            <td className="px-4 py-3 text-[#111827] font-semibold border-b border-[#f3f4f6] max-w-[220px]">
                              {row}
                            </td>
                            {previewCols.map((col, ci) => (
                              <td
                                key={`${col}-${ci}`}
                                className="px-4 py-3 text-center border-b border-[#f3f4f6]"
                              >
                                <input
                                  type="radio"
                                  readOnly
                                  tabIndex={-1}
                                  name={`matrix-preview-${index}-${rowIdx}`}
                                  className="h-5 w-5 accent-[#ea580c] pointer-events-none"
                                  aria-label={`${row}: ${col}`}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[100px] text-sm text-[#6b7280] font-medium">
                    Grid preview will appear here
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OptionListEditor
                label="Row topics"
                hint="Left side of the grid"
                items={rows.length ? rows : [""]}
                placeholder="e.g. Corruption"
                addLabel="Add topic"
                onChange={(next) => {
                  persistRows(next.length ? next : [""]);
                }}
              />
              <div className="flex flex-col gap-3">
                <OptionListEditor
                  label="Column options"
                  hint="Shared for every topic"
                  items={cols.length ? cols : [""]}
                  placeholder="e.g. Increased"
                  addLabel="Add answer"
                  onChange={(next) => {
                    persistCols(next.length ? next : [""]);
                  }}
                />
                <div>
                  <p className="text-xs font-semibold text-[#374151] mb-1.5">
                    Quick fill (Hindi)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLUMN_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPreset(preset.values)}
                        className="text-xs px-2.5 py-1.5 rounded-full border border-[#fdba74] text-[#9a3412] hover:bg-[#fff7ed] bg-white font-medium"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced options */}
            <div className="border-t border-secondary-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-sm font-medium text-secondary-400 hover:text-secondary-600"
              >
                {showAdvanced ? "Hide" : "Show"} advanced options
              </button>

              {showAdvanced && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400 pt-2">
                      Hidden column options
                    </label>
                    <div className="col-span-12 sm:col-span-8">
                      <textarea
                        className="border border-secondary-200 rounded-md p-2 w-full text-sm"
                        {...register(
                          `questions.${index}.parameters.hidden_column_options`
                        )}
                        rows={2}
                        placeholder="Optional — one option per line"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Variable name
                    </label>
                    <input
                      {...register(`questions.${index}.parameters.variable_name`)}
                      type="text"
                      className="border border-secondary-200 rounded-md p-2 col-span-12 sm:col-span-8 text-sm"
                      placeholder="Optional variable name"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      All rows required?
                    </label>
                    <input
                      {...register(
                        `questions.${index}.parameters.are_all_questions_required`
                      )}
                      type="checkbox"
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-start">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400 pt-2">
                      Minimum rows required
                    </label>
                    <div className="col-span-12 sm:col-span-8">
                      <input
                        {...register(
                          `questions.${index}.parameters.minimum_questions_required`
                        )}
                        type="number"
                        min={0}
                        className="border border-secondary-200 rounded-md p-2 w-full text-sm"
                        placeholder="e.g. 3"
                      />
                      <p className="text-xs text-secondary-300 mt-1">
                        If set, &quot;All rows required&quot; is ignored.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Randomize rows
                    </label>
                    <input
                      {...register(
                        `questions.${index}.parameters.randomize_row_options`
                      )}
                      type="checkbox"
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Randomize columns
                    </label>
                    <input
                      {...register(
                        `questions.${index}.parameters.randomize_column_options`
                      )}
                      type="checkbox"
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Forward rows from
                    </label>
                    <input
                      {...register(
                        `questions.${index}.parameters.forward_row_options_from`
                      )}
                      type="text"
                      className="border border-secondary-200 rounded-md p-2 col-span-12 sm:col-span-8 text-sm"
                      placeholder="Variable name"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Forward rows type
                    </label>
                    <select
                      className="border border-secondary-200 rounded-md p-2 col-span-12 sm:col-span-8 text-sm"
                      {...register(
                        `questions.${index}.parameters.forward_row_options_type`
                      )}
                    >
                      <option value=""></option>
                      <option value="selected">Selected</option>
                      <option value="unselected">UnSelected</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Forward columns from
                    </label>
                    <input
                      {...register(
                        `questions.${index}.parameters.forward_column_options_from`
                      )}
                      type="text"
                      className="border border-secondary-200 rounded-md p-2 col-span-12 sm:col-span-8 text-sm"
                      placeholder="Variable name"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <label className="col-span-12 sm:col-span-4 text-sm text-secondary-400">
                      Forward columns type
                    </label>
                    <select
                      className="border border-secondary-200 rounded-md p-2 col-span-12 sm:col-span-8 text-sm"
                      {...register(`questions.${index}.parameters.forward_column`)}
                    >
                      <option value=""></option>
                      <option value="selected">Selected</option>
                      <option value="unselected">UnSelected</option>
                    </select>
                  </div>

                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                    Tip: Too many rows/columns may need horizontal scroll on
                    small mobile screens.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RadioGridForm;
