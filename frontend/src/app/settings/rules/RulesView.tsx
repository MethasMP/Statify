"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, Check, X, Shield } from "lucide-react";
import { ingestionApi } from "@/features/ingestion/api/ingestionApi";
import type { CategorizationRule, Category } from "@/features/ingestion/types";

function RuleRow({ rule, categories }: { rule: CategorizationRule; categories: Category[] }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [keyword, setKeyword] = useState(rule.keyword);
  const [catId, setCatId] = useState(rule.category.id);

  const updateMutation = useMutation({
    mutationFn: () => ingestionApi.updateRule(rule.id, { keyword, categoryId: catId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rules"] }); setEditing(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => ingestionApi.deleteRule(rule.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
  });

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-border/40 hover:bg-accent/5 group/row transition-colors"
    >
      <td className="p-3">
        {editing ? (
          <input
            autoFocus
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="bg-background border border-accent/40 text-accent font-mono text-[9px] px-2 py-1 outline-none w-full"
          />
        ) : (
          <span className="font-mono text-[9px] text-foreground/80">{rule.keyword}</span>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <select
            value={catId}
            onChange={e => setCatId(Number(e.target.value))}
            className="bg-background border border-accent/40 text-accent font-mono text-[9px] px-2 py-1 outline-none"
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <span
            className="font-mono text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider"
            style={{ background: rule.category.color + "22", color: rule.category.color }}
          >
            {rule.category.name}
          </span>
        )}
      </td>
      <td className="p-3 font-mono text-[8px] text-muted-foreground tabular-nums">
        {rule.matchCount.toLocaleString()}
      </td>
      <td className="p-3">
        {rule.system ? (
          <span className="flex items-center gap-1 font-mono text-[7px] text-muted-foreground/40 uppercase tracking-widest">
            <Shield className="w-3 h-3" /> Protected
          </span>
        ) : (
          <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
            {editing ? (
              <>
                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="p-1 text-safe hover:bg-safe/10 transition-colors cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="p-1 text-muted-foreground hover:text-danger transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        )}
      </td>
    </motion.tr>
  );
}

export default function RulesView() {
  const qc = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");
  const [newCatId, setNewCatId] = useState<number | "">("");
  const [showAdd, setShowAdd] = useState(false);

  const { data: rules } = useSuspenseQuery<CategorizationRule[]>({
    queryKey: ["rules"],
    queryFn: ingestionApi.getRules,
  });
  const { data: categories } = useSuspenseQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: ingestionApi.getCategories,
  });

  const addMutation = useMutation({
    mutationFn: () => ingestionApi.addRule({
      keyword: newKeyword,
      categoryId: Number(newCatId),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rules"] });
      setNewKeyword("");
      setNewCatId("");
      setShowAdd(false);
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-[0.4em] mb-1">SETTINGS</p>
          <h1 className="font-mono text-xl font-black uppercase tracking-tight">
            Categorization Rules
          </h1>
          <p className="font-mono text-[9px] text-muted-foreground/60 mt-1">
            {rules.length} rules active · {rules.filter(r => r.system).length} system-protected
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 border border-accent/40 text-accent/70 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all font-mono text-[8px] uppercase tracking-widest px-4 py-2 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Rule
        </button>
      </div>

      {/* Add Rule Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border border-accent/20 bg-accent/5 p-6 mb-6 overflow-hidden"
          >
            <p className="font-mono text-[8px] text-accent/60 uppercase tracking-widest mb-4">New Rule</p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-widest block mb-1">
                  Keyword (case-insensitive)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GRAB FOOD"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  className="w-full bg-background border border-border focus:border-accent font-mono text-[9px] px-3 py-2 outline-none uppercase"
                />
              </div>
              <div className="w-48">
                <label className="font-mono text-[8px] text-muted-foreground/50 uppercase tracking-widest block mb-1">
                  Category
                </label>
                <select
                  value={newCatId}
                  onChange={e => setNewCatId(Number(e.target.value))}
                  className="w-full bg-background border border-border focus:border-accent font-mono text-[9px] px-3 py-2 outline-none"
                >
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button
                onClick={() => addMutation.mutate()}
                disabled={!newKeyword || !newCatId || addMutation.isPending}
                className="bg-accent text-black font-mono font-bold text-[8px] uppercase tracking-widest px-5 py-2 hover:bg-white transition-colors cursor-pointer disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Table */}
      <div className="border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Keyword", "Category", "Match Count", "Actions"].map(h => (
                <th key={h} className="p-3 font-mono text-[8px] uppercase font-bold text-muted-foreground tracking-widest text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rules.map(rule => (
                <RuleRow key={rule.id} rule={rule} categories={categories} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {rules.length === 0 && (
          <p className="py-12 text-center font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            No rules defined yet.
          </p>
        )}
      </div>
    </div>
  );
}
