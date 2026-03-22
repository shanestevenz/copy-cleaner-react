"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomRule } from "@/lib/text-transforms";

interface CustomRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rule: CustomRule) => void;
}

export function CustomRuleDialog({ open, onOpenChange, onSave }: CustomRuleDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomRule["type"]>("remove");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");

  const handleSave = () => {
    if (!name.trim() || !find.trim()) return;

    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      find: find,
      replace: replace,
    });

    setName("");
    setType("remove");
    setFind("");
    setReplace("");
    onOpenChange(false);
  };

  const showReplace = type === "replace" || type === "regex";
  const findLabel =
    type === "prefix" || type === "suffix"
      ? type === "prefix"
        ? "Prefix text"
        : "Suffix text"
      : type === "regex"
        ? "Regex pattern"
        : "Text to find";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Custom Rule</DialogTitle>
          <DialogDescription>
            Build a reusable text transformation you can apply anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rule-name" className="text-xs text-muted-foreground">
              Rule Name
            </Label>
            <Input
              id="rule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My custom rule"
              className="bg-input border-border text-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rule-type" className="text-xs text-muted-foreground">
              Type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as CustomRule["type"])}>
              <SelectTrigger id="rule-type" className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="remove">Remove text</SelectItem>
                <SelectItem value="replace">Find & Replace</SelectItem>
                <SelectItem value="prefix">Add prefix to lines</SelectItem>
                <SelectItem value="suffix">Add suffix to lines</SelectItem>
                <SelectItem value="regex">Regex replace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rule-find" className="text-xs text-muted-foreground">
              {findLabel}
            </Label>
            <Input
              id="rule-find"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder={type === "regex" ? "e.g. \\d+" : "Enter text..."}
              className="bg-input border-border text-foreground font-mono text-sm"
            />
          </div>

          {showReplace && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="rule-replace" className="text-xs text-muted-foreground">
                Replace with
              </Label>
              <Input
                id="rule-replace"
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replacement text (leave empty to delete)"
                className="bg-input border-border text-foreground font-mono text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !find.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
