export default function FeatureHighlights() {
  const items = [
    { icon: "✨", title: "10 种爆款风格", desc: "种草/干货/悬念/对比/清单等" },
    { icon: "📝", title: "正文大纲", desc: "结构 + 标签 + 配图建议" },
    { icon: "📋", title: "24 个选题模板", desc: "一键填入，覆盖主流赛道" },
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
