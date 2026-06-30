"use client";

import PhonePreview from "./PhonePreview";

interface PhonePreviewModalProps {
  open: boolean;
  title: string;
  coverText?: string;
  onClose: () => void;
}

export default function PhonePreviewModal({
  open,
  title,
  coverText,
  onClose,
}: PhonePreviewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-center">
          <h3 className="text-lg font-bold text-zinc-900">📱 小红书预览</h3>
          <p className="mt-1 text-xs text-zinc-500">
            看看标题在信息流和详情页的效果
          </p>
        </div>

        <PhonePreview title={title} coverText={coverText} />

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-zinc-100 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200 transition"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
