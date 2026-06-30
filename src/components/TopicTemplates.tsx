"use client";

import { TOPIC_TEMPLATES } from "@/lib/templates";

interface TopicTemplatesProps {
  onSelect: (topic: string, keywords: string) => void;
}

export default function TopicTemplates({ onSelect }: TopicTemplatesProps) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-medium text-zinc-500">快速选题 · 点击填入</p>
      <div className="flex flex-wrap gap-2">
        {TOPIC_TEMPLATES.map((tpl) => (
          <button
            key={tpl.label}
            type="button"
            onClick={() => onSelect(tpl.topic, tpl.keywords)}
            className="rounded-full border border-rose-100 bg-rose-50/50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700"
          >
            {tpl.emoji} {tpl.label}
          </button>
        ))}
      </div>
    </div>
  );
}
