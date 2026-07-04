"use client";

import { useState } from "react";
import { Check, Circle, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectStageItem, StageWithItems } from "@/lib/types";

// Interactive checklist for a project: tick items, mark phases complete,
// add your own items and phases. Updates the database as you go, and keeps
// a local copy so the UI responds instantly.
export function StageTracker({
  projectId,
  initialStages,
}: {
  projectId: string;
  initialStages: StageWithItems[];
}) {
  const supabase = createClient();

  const [stages, setStages] = useState<StageWithItems[]>(() =>
    [...initialStages]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        ...s,
        project_stage_items: [...(s.project_stage_items ?? [])].sort(
          (a, b) => a.position - b.position
        ),
      }))
  );
  const [addItemFor, setAddItemFor] = useState<string | null>(null);
  const [itemText, setItemText] = useState("");
  const [stageText, setStageText] = useState("");
  const [addingStage, setAddingStage] = useState(false);

  const total = stages.length;
  const done = stages.filter((s) => s.completed).length;
  const currentIndex = stages.findIndex((s) => !s.completed);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  async function toggleStage(stage: StageWithItems) {
    const completed = !stage.completed;
    const completed_at = completed ? new Date().toISOString() : null;
    setStages((prev) =>
      prev.map((s) => (s.id === stage.id ? { ...s, completed, completed_at } : s))
    );
    await supabase
      .from("project_stages")
      .update({ completed, completed_at })
      .eq("id", stage.id);
  }

  async function toggleItem(stageId: string, item: ProjectStageItem) {
    const checked = !item.checked;
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? {
              ...s,
              project_stage_items: s.project_stage_items.map((it) =>
                it.id === item.id ? { ...it, checked } : it
              ),
            }
          : s
      )
    );
    await supabase
      .from("project_stage_items")
      .update({ checked })
      .eq("id", item.id);
  }

  async function addItem(stageId: string) {
    const label = itemText.trim();
    if (!label) return;
    const stage = stages.find((s) => s.id === stageId);
    const position = stage ? stage.project_stage_items.length : 0;
    const { data } = await supabase
      .from("project_stage_items")
      .insert({ stage_id: stageId, label, position })
      .select()
      .single<ProjectStageItem>();
    if (data) {
      setStages((prev) =>
        prev.map((s) =>
          s.id === stageId
            ? { ...s, project_stage_items: [...s.project_stage_items, data] }
            : s
        )
      );
    }
    setItemText("");
    setAddItemFor(null);
  }

  async function deleteItem(stageId: string, itemId: string) {
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? {
              ...s,
              project_stage_items: s.project_stage_items.filter(
                (it) => it.id !== itemId
              ),
            }
          : s
      )
    );
    await supabase.from("project_stage_items").delete().eq("id", itemId);
  }

  async function addStage() {
    const name = stageText.trim();
    if (!name) return;
    const { data } = await supabase
      .from("project_stages")
      .insert({ project_id: projectId, name, position: stages.length })
      .select()
      .single<StageWithItems>();
    if (data) {
      setStages((prev) => [...prev, { ...data, project_stage_items: [] }]);
    }
    setStageText("");
    setAddingStage(false);
  }

  async function deleteStage(stageId: string) {
    if (!window.confirm("Delete this phase and its checklist?")) return;
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    await supabase.from("project_stages").delete().eq("id", stageId);
  }

  return (
    <div className="card p-6 sm:p-8">
      {/* Progress header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Progress</h2>
          <p className="mt-0.5 text-sm text-muted">
            {done} of {total} phases complete
            {currentIndex >= 0 && (
              <>
                {" · "}
                <span className="text-ink">
                  Current: {stages[currentIndex].name}
                </span>
              </>
            )}
          </p>
        </div>
        <span className="font-mono text-sm text-muted">{pct}%</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stepper */}
      <div className="relative mt-8">
        <div className="absolute bottom-4 left-[15px] top-2 w-px bg-line" />
        <ol className="space-y-8">
          {stages.map((stage, i) => {
            const isCurrent = i === currentIndex;
            const itemsDone = stage.project_stage_items.filter(
              (it) => it.checked
            ).length;
            return (
              <li key={stage.id} className="relative pl-11">
                {/* Status circle */}
                <button
                  onClick={() => toggleStage(stage)}
                  title={stage.completed ? "Mark as not done" : "Mark complete"}
                  className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    stage.completed
                      ? "border-accent bg-accent text-white"
                      : isCurrent
                        ? "border-accent bg-card text-accent"
                        : "border-line-strong bg-card text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {stage.completed ? (
                    <Check size={16} strokeWidth={2.5} />
                  ) : (
                    <Circle size={9} strokeWidth={4} />
                  )}
                </button>

                {/* Stage header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className={`text-base font-semibold tracking-tight ${
                        stage.completed ? "text-muted line-through" : "text-ink"
                      }`}
                    >
                      {stage.name}
                    </h3>
                    {stage.description && (
                      <p className="mt-0.5 text-sm text-muted">
                        {stage.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="badge shrink-0">Current phase</span>
                    )}
                    <button
                      onClick={() => deleteStage(stage.id)}
                      title="Delete phase"
                      className="rounded-md p-1 text-muted transition hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Checklist items */}
                {stage.project_stage_items.length > 0 && (
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                    {itemsDone}/{stage.project_stage_items.length} items
                  </p>
                )}
                <ul className="mt-2 space-y-1.5">
                  {stage.project_stage_items.map((item) => (
                    <li key={item.id} className="group flex items-start gap-2.5">
                      <button
                        onClick={() => toggleItem(stage.id, item)}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          item.checked
                            ? "border-accent bg-accent text-white"
                            : "border-line-strong bg-card hover:border-accent"
                        }`}
                      >
                        {item.checked && <Check size={11} strokeWidth={3} />}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          item.checked
                            ? "text-muted line-through"
                            : "text-ink/90"
                        }`}
                      >
                        {item.label}
                      </span>
                      <button
                        onClick={() => deleteItem(stage.id, item.id)}
                        title="Remove item"
                        className="mt-0.5 text-muted opacity-0 transition hover:text-danger group-hover:opacity-100"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Add an item */}
                {addItemFor === stage.id ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={itemText}
                      onChange={(e) => setItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItem(stage.id);
                        }
                        if (e.key === "Escape") setAddItemFor(null);
                      }}
                      placeholder="New checklist item…"
                      className="input py-1.5 text-sm"
                    />
                    <button
                      onClick={() => addItem(stage.id)}
                      className="btn-primary shrink-0 px-3 py-1.5"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddItemFor(stage.id);
                      setItemText("");
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-accent"
                  >
                    <Plus size={13} /> Add item
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Add a phase */}
      <div className="mt-8 border-t border-line pt-5">
        {addingStage ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={stageText}
              onChange={(e) => setStageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addStage();
                }
                if (e.key === "Escape") setAddingStage(false);
              }}
              placeholder="New phase name…"
              className="input"
            />
            <button
              onClick={addStage}
              className="btn-primary shrink-0"
            >
              Add phase
            </button>
            <button
              onClick={() => setAddingStage(false)}
              className="btn-secondary shrink-0"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setAddingStage(true);
              setStageText("");
            }}
            className="btn-secondary"
          >
            <Plus size={15} /> Add a phase
          </button>
        )}
      </div>
    </div>
  );
}
