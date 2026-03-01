"use client"

import { useState, useCallback } from "react"
import {
  Scissors,
  Minimize2,
  Minus,
  FoldVertical,
  IndentDecrease,
  ArrowUp,
  ArrowDown,
  Type,
  Text,
  RefreshCw,
  Hash,
  ArrowDownAZ,
  ArrowDownUp,
  CopyMinus,
  Quote,
  Merge,
  X,
  Replace,
  Eraser,
  Code,
  Link,
  Mail,
  Zap,
  Wrench,
  Plus,
  TextCursorInput,
  LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { TextSelection } from "@/components/text-editor"
import {
  type TextTransform,
  type CustomRule,
  builtInTransforms,
  applyCustomRule,
} from "@/lib/text-transforms"

const iconMap: Record<string, LucideIcon> = {
  scissors: Scissors,
  "minimize-2": Minimize2,
  minus: Minus,
  "fold-vertical": FoldVertical,
  "indent-decrease": IndentDecrease,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  type: Type,
  text: Text,
  "refresh-cw": RefreshCw,
  hash: Hash,
  "arrow-down-a-z": ArrowDownAZ,
  "arrow-down-up": ArrowDownUp,
  "copy-minus": CopyMinus,
  quote: Quote,
  merge: Merge,
  x: X,
  replace: Replace,
  eraser: Eraser,
  code: Code,
  link: Link,
  mail: Mail,
}

const categoryLabels: Record<string, { label: string; icon: LucideIcon }> = {
  cleanup: { label: "Cleanup", icon: Scissors },
  case: { label: "Change Case", icon: Type },
  format: { label: "Format", icon: ArrowDownAZ },
  remove: { label: "Remove / Replace", icon: X },
  custom: { label: "Custom Rules", icon: Wrench },
}

interface ToolPanelProps {
  text: string
  onApply: (newText: string) => void
  customRules: CustomRule[]
  onAddCustomRule: () => void
  onDeleteCustomRule: (id: string) => void
  selection: TextSelection | null
  selectionMode: boolean
  onSelectionModeChange: (enabled: boolean) => void
}

export function ToolPanel({
  text,
  onApply,
  customRules,
  onAddCustomRule,
  onDeleteCustomRule,
  selection,
  selectionMode,
  onSelectionModeChange,
}: ToolPanelProps) {
  const [activeCategory, setActiveCategory] = useState<string>("cleanup")
  const [paramInputs, setParamInputs] = useState<Record<string, string>>({})

  const isSelectionActive = selectionMode && selection && selection.start !== selection.end

  const applyToTextOrSelection = useCallback(
    (transformFn: (input: string) => string) => {
      if (!text) return
      if (isSelectionActive && selection) {
        const before = text.substring(0, selection.start)
        const selected = text.substring(selection.start, selection.end)
        const after = text.substring(selection.end)
        const transformed = transformFn(selected)
        onApply(before + transformed + after)
      } else {
        onApply(transformFn(text))
      }
    },
    [text, isSelectionActive, selection, onApply]
  )

  const handleTransform = (transform: TextTransform) => {
    if (!text) return
    const params = transform.hasParams ? { keyword: paramInputs[transform.id] || "" } : undefined
    applyToTextOrSelection((input) => transform.action(input, params))
  }

  const handleCustomRule = (rule: CustomRule) => {
    if (!text) return
    applyToTextOrSelection((input) => applyCustomRule(input, rule))
  }

  const categories = ["cleanup", "case", "format", "remove", "custom"]
  const filteredTransforms = builtInTransforms.filter(
    (t) => t.category === activeCategory
  )

  return (
    <div className="flex flex-col h-full">
      {/* Selection mode toggle */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <button
          onClick={() => onSelectionModeChange(!selectionMode)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all w-full ${isSelectionActive
            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
            : selectionMode
              ? "bg-accent text-accent-foreground ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
        >
          <TextCursorInput className="size-5 shrink-0" />  {/* toggle icon */}
          <span className="flex-1 text-left">
            {isSelectionActive
              ? `Selection (${selection!.text.length} chars)`
              : selectionMode
                ? "Selection mode on - select text"
                : "Apply to selection only"}
          </span>

          <Switch
            checked={selectionMode}
            onCheckedChange={onSelectionModeChange}
            className="pointer-events-none"
          />

        </button>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 px-3 py-3 border-b border-border
                overflow-x-auto md:overflow-x-visible
                whitespace-nowrap md:flex-wrap
                scrollbar-hidden">
        {categories.map((cat) => {
          const { label, icon: CatIcon } = categoryLabels[cat]
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
            >
              <CatIcon className="size-3.5" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Tool buttons */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeCategory !== "custom" ? (
          <div className="flex flex-col gap-2">
            {filteredTransforms.map((transform) => {
              const IconComp = iconMap[transform.icon] || Zap
              return (
                <div key={transform.id} className="flex flex-col gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransform(transform)}
                        disabled={!text}
                        className="justify-start gap-2 h-auto py-2.5 px-3 bg-card border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                      >
                        <IconComp className="size-4 text-primary shrink-0" />
                        <div className="flex flex-col items-start gap-0.5 text-left">
                          <span className="text-xs font-medium">
                            {transform.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-tight">
                            {transform.description}
                          </span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {transform.description}
                    </TooltipContent>
                  </Tooltip>
                  {transform.hasParams && (
                    <Input
                      value={paramInputs[transform.id] || ""}
                      onChange={(e) =>
                        setParamInputs((prev) => ({
                          ...prev,
                          [transform.id]: e.target.value,
                        }))
                      }
                      placeholder={transform.paramPlaceholder}
                      className="text-xs h-8 bg-input border-border text-foreground placeholder:text-muted-foreground"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTransform(transform)
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCustomRule}
              className="justify-center gap-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Plus className="size-4" />
              Add Custom Rule
            </Button>

            {customRules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Wrench className="size-8 text-muted-foreground/40 mb-3" />
                <p className="text-xs text-muted-foreground">
                  No custom rules yet
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Create reusable text transformations
                </p>
              </div>
            )}

            {customRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 group"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomRule(rule)}
                  disabled={!text}
                  className="flex-1 justify-start gap-2 h-auto py-2.5 px-3 bg-card border-border hover:bg-accent hover:text-accent-foreground text-foreground"
                >
                  <Zap className="size-4 text-primary shrink-0" />
                  <div className="flex flex-col items-start gap-0.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{rule.name}</span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {rule.type}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground leading-tight truncate max-w-[180px]">
                      {rule.type === "remove" && `Remove "${rule.find}"`}
                      {rule.type === "replace" &&
                        `"${rule.find}" → "${rule.replace}"`}
                      {rule.type === "prefix" && `Prefix: "${rule.find}"`}
                      {rule.type === "suffix" && `Suffix: "${rule.find}"`}
                      {rule.type === "regex" &&
                        `/${rule.find}/ → "${rule.replace}"`}
                    </span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteCustomRule(rule.id)}
                  className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
