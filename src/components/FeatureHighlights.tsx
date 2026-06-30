export default function FeatureHighlights() {
  const items = [
    { icon: "📊", title: "爆款指数", desc: "AI 评分自动排序" },
    { icon: "⚖️", title: "A/B 对比", desc: "两条标题并排预览" },
    { icon: "🛡️", title: "敏感词检测", desc: "规则 + AI 双重审核" },
    { icon: "📊", title: "CSV 导出", desc: "Excel 直接打开" },
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
