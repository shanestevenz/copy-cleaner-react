"use client";

import { useMemo } from "react";
import { FileText, AlignLeft, Hash, Type, TextCursorInput } from "lucide-react";
import type { TextSelection } from "@/components/text-editor";

interface StatsBarProps {
  text: string;
  selection?: TextSelection | null;
  selectionMode?: boolean;
}

export function StatsBar({ text, selection, selectionMode }: StatsBarProps) {
  const isSelectionActive = selectionMode && selection && selection.start !== selection.end;

  const stats = useMemo(() => {
    if (!text) return { chars: 0, words: 0, lines: 0, sentences: 0 };

    const chars = text.length;
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const lines = text.split("\n").length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    return { chars, words, lines, sentences };
  }, [text]);

  const selectionStats = useMemo(() => {
    if (!isSelectionActive || !selection) return null;
    const selText = selection.text;
    const chars = selText.length;
    const words = selText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    const lines = selText.split("\n").length;
    return { chars, words, lines };
  }, [isSelectionActive, selection]);

  const items = [
    { icon: Type, label: "Characters", value: stats.chars },
    { icon: FileText, label: "Words", value: stats.words },
    { icon: AlignLeft, label: "Lines", value: stats.lines },
    { icon: Hash, label: "Sentences", value: stats.sentences },
  ];

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
      {selectionStats ? (
        <>
          <div className="flex items-center gap-1.5 text-primary">
            <TextCursorInput className="size-3" />
            <span className="font-medium">Selection:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Type className="size-3" />
            <span className="font-mono text-primary">{selectionStats.chars.toLocaleString()}</span>
            <span className="hidden sm:inline">chars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="size-3" />
            <span className="font-mono text-primary">{selectionStats.words.toLocaleString()}</span>
            <span className="hidden sm:inline">words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlignLeft className="size-3" />
            <span className="font-mono text-primary">{selectionStats.lines.toLocaleString()}</span>
            <span className="hidden sm:inline">lines</span>
          </div>
          <div className="w-px h-3 bg-border" />
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 opacity-50">
              <item.icon className="size-3" />
              <span className="font-mono text-foreground">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </>
      ) : (
        items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <item.icon className="size-3" />
            <span className="hidden sm:inline">{item.label}:</span>
            <span className="font-mono text-foreground">{item.value.toLocaleString()}</span>
          </div>
        ))
      )}
    </div>
  );
}
