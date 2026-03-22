"use client";

import { useCallback, useRef, useEffect } from "react";
import { ClipboardPaste, Copy, Trash2, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

interface TextEditorProps {
  text: string;
  setText: (text: string) => void;
  history: string[];
  historyIndex: number;
  setHistory: (history: string[]) => void;
  setHistoryIndex: (index: number) => void;
  onSelectionChange?: (selection: TextSelection | null) => void;
}

export function TextEditor({
  text,
  setText,
  history,
  historyIndex,
  setHistory,
  setHistoryIndex,
  onSelectionChange,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pushToHistory = useCallback(
    (newText: string) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setText(newText);
    },
    [history, historyIndex, setHistory, setHistoryIndex, setText]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
    }
  }, [historyIndex, history, setHistoryIndex, setText]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setText(history[newIndex]);
    }
  }, [historyIndex, history, setHistoryIndex, setText]);

  const handlePaste = useCallback(async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      pushToHistory(clipText);
    } catch {
      // fallback: focus textarea so user can Ctrl+V
      textareaRef.current?.focus();
    }
  }, [pushToHistory]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // silent fail
    }
  }, [text]);

  const handleClear = useCallback(() => {
    pushToHistory("");
  }, [pushToHistory]);

  const handleSelectionChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !onSelectionChange) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      onSelectionChange({
        start,
        end,
        text: textarea.value.substring(start, end),
      });
    } else {
      onSelectionChange(null);
    }
  }, [onSelectionChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <ClipboardPaste className="size-4" />
              <span className="hidden sm:inline text-xs">Paste</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Paste from clipboard</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!text}
              className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Copy className="size-4" />
              <span className="hidden sm:inline text-xs">Copy</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>

        <div className="w-px h-4 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="text-muted-foreground hover:text-foreground hover:bg-accent size-8"
            >
              <Undo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="text-muted-foreground hover:text-foreground hover:bg-accent size-8"
            >
              <Redo2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!text}
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              <span className="hidden sm:inline text-xs">Clear</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all text</TooltipContent>
        </Tooltip>
      </div>

      {/* Textarea */}
      <div className="flex-1 min-h-0 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => pushToHistory(e.target.value)}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder="Paste or type your text here..."
          className="absolute inset-0 w-full h-full resize-none bg-transparent text-foreground text-sm font-mono leading-relaxed p-4 focus:outline-none placeholder:text-muted-foreground/50"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
