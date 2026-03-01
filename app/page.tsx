"use client"

import { useState, useCallback } from "react"
import { WandSparkles  } from "lucide-react"
import { TextEditor } from "@/components/text-editor"
import type { TextSelection } from "@/components/text-editor"
import { ToolPanel } from "@/components/tool-panel"
import { StatsBar } from "@/components/stats-bar"
import { CustomRuleDialog } from "@/components/custom-rule-dialog"
import type { CustomRule } from "@/lib/text-transforms"

export default function Page() {
  const [text, setText] = useState("")
  const [history, setHistory] = useState<string[]>([""])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [customRules, setCustomRules] = useState<CustomRule[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selection, setSelection] = useState<TextSelection | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)

  const applyTransform = useCallback(
    (newText: string) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newText)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setText(newText)
    },
    [history, historyIndex]
  )

  const handleSaveCustomRule = useCallback((rule: CustomRule) => {
    setCustomRules((prev) => [...prev, rule])
  }, [])

  const handleDeleteCustomRule = useCallback((id: string) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary"> {/*Logo */}
            <WandSparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">
              CopyCleaner
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Paste. Clean. Copy.
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Editor */}
        <div className="flex flex-col flex-1 min-w-0">
          <TextEditor
            text={text}
            setText={setText}
            history={history}
            historyIndex={historyIndex}
            setHistory={setHistory}
            setHistoryIndex={setHistoryIndex}
            onSelectionChange={setSelection}
          />
          <StatsBar text={text} selection={selection} selectionMode={selectionMode} />
        </div>

        {/* Desktop Tool sidebar */}
        <div className="w-72 lg:w-80 border-l border-border shrink-0 hidden md:flex flex-col ">
          <ToolPanel
            text={text}
            onApply={applyTransform}
            customRules={customRules}
            onAddCustomRule={() => setDialogOpen(true)}
            onDeleteCustomRule={handleDeleteCustomRule}
            selection={selection}
            selectionMode={selectionMode}
            onSelectionModeChange={setSelectionMode}
          />
        </div>
      </div>

      {/* Mobile tool panel as a bottom sheet style */}
      <div className="md:hidden border-t border-border max-h-[40vh] overflow-y-auto">
        <ToolPanel
          text={text}
          onApply={applyTransform}
          customRules={customRules}
          onAddCustomRule={() => setDialogOpen(true)}
          onDeleteCustomRule={handleDeleteCustomRule}
          selection={selection}
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
        />
      </div>

      <CustomRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveCustomRule}
      />
    </div>
  )
}
