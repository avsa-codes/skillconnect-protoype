// "use client"

// import { useState, type KeyboardEvent } from "react"
// import { X } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { cn } from "@/lib/utils"

// interface SkillTagsProps {
//   value: string[]
//   onChange: (value: string[]) => void
//   maxTags?: number
//   placeholder?: string
//   className?: string
// }

// export function SkillTags({ value, onChange, maxTags = 5, placeholder = "Add a skill...", className }: SkillTagsProps) {
//   const [inputValue, setInputValue] = useState("")

// const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
//   if (e.key === "Enter" || e.key === ",") {
//     e.preventDefault();
//     e.stopPropagation(); // 👈 important

//     const newTag = inputValue.trim();

//     if (
//       newTag &&
//       !value.includes(newTag) &&
//       value.length < maxTags
//     ) {
//       onChange([...value, newTag]);
//       setInputValue("");
//     }
//   }

//   if (e.key === "Backspace" && !inputValue && value.length > 0) {
//     onChange(value.slice(0, -1));
//   }
// };





//   const removeTag = (tagToRemove: string) => {
//     onChange(value.filter((tag) => tag !== tagToRemove))
//   }

//   return (
//     <div className={cn("space-y-2", className)}>
//       <div className="flex flex-wrap gap-2">
//         {value.map((tag) => (
//           <span
//             key={tag}
//             className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
//           >
//             {tag}
//             <button type="button" onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
//               <X className="h-3 w-3" />
//               <span className="sr-only">Remove {tag}</span>
//             </button>
//           </span>
//         ))}
//       </div>
//       {value.length < maxTags && (
//        <Input
//   value={inputValue}
//   onChange={(e) => setInputValue(e.target.value)}
//   onKeyDownCapture={handleKeyDown}
//   placeholder={placeholder}
//   className="rounded-xl"
// />
//       )}
//       <p className="text-xs text-muted-foreground">
//         Press Enter or comma to add. {value.length}/{maxTags} skills
//       </p>
//     </div>
//   )
// }

// export { SkillTags as SkillTagsInput }


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

  const addTag = () => {
    const newTag = inputValue.trim();
    if (!newTag) return;
    if (value.includes(newTag)) return;
    if (value.length >= maxTags) return;

    onChange([...value, newTag]);
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
            addTag();
          }}
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="rounded-xl"
          />
        </form>
      )}

      <p className="text-xs text-muted-foreground">
        Press Enter to add. {value.length}/{maxTags} skills
      </p>
    </div>
  );
}

export { SkillTags as SkillTagsInput };
