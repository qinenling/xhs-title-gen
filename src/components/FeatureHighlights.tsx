export default function FeatureHighlights() {
  const items = [
    { icon: "📊", title: "爆款指数", desc: "每条标题 AI 评分排序" },
    { icon: "🎯", title: "对标仿写", desc: "粘贴爆款，同结构出新标题" },
    { icon: "📦", title: "完整笔记包", desc: "大纲+标签+首评+封面文案" },
    { icon: "⚡", title: "历史 & 收藏", desc: "本地保存，随时复用" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-rose-100 bg-white/80 px-3 py-3 text-center shadow-sm"
        >
          <span className="text-xl">{item.icon}</span>
          <p className="mt-1 text-xs font-semibold text-zinc-800">{item.title}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-zinc-400">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
