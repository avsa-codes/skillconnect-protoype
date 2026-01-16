"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SkillTagsProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

export function SkillTags({
  value,
  onChange,
  maxTags = 5,
  placeholder = "Add a skill...",
  className,
}: SkillTagsProps) {
  const [inputValue, setInputValue] = useState("");

  const addTagsFromInput = (rawInput: string) => {
    if (!rawInput.trim()) return;

    // Split by comma
    const parts = rawInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const newTags: string[] = [];

    for (const tag of parts) {
      if (value.includes(tag)) continue;
      if (newTags.includes(tag)) continue;
      if (value.length + newTags.length >= maxTags) break;
      newTags.push(tag);
    }

    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }

    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Existing tags */}
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      {value.length < maxTags && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTagsFromInput(inputValue);
          }}
        >
          <Input
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;

              // If user types comma, auto-process
              if (val.includes(",")) {
                addTagsFromInput(val);
              } else {
                setInputValue(val);
              }
            }}
            placeholder={placeholder}
            className="rounded-xl"
          />
        </form>
      )}

      <p className="text-xs text-muted-foreground">
        Type skills separated by commas or press Enter. {value.length}/{maxTags} skills
      </p>
    </div>
  );
}

export { SkillTags as SkillTagsInput };
