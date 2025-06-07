"use client"

import { Badge } from "@/components/ui/badge"

interface SlidePatternTagProps {
  tag: string
  selected: boolean
  onSelect: (tag: string) => void
}

export function SlidePatternTag({ tag, selected, onSelect }: SlidePatternTagProps) {
  return (
    <Badge variant={selected ? "default" : "outline"} className="cursor-pointer" onClick={() => onSelect(tag)}>
      {tag}
    </Badge>
  )
}
