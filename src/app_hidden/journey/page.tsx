"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// User personas data
const personas = [
  {
    id: "eleanor",
    name: "Eleanor Watson",
    age: 71,
    type: "日常生活型",
    description: "退休图书管理员，膝关节炎，喜欢去公园和超市",
    icon: "🏠",
    color: "#2AAAA0",
  },
  {
    id: "margaret",
    name: "Margaret Chen",
    age: 68,
    type: "社交活跃型",
    description: "退休教师，喜欢咖啡馆、餐厅和朋友聚会",
    icon: "☕",
    color: "#F5A623",
  },
  {
    id: "robert",
    name: "Robert Johnson",
    age: 75,
    type: "旅行爱好型",
    description: "退休企业主，经常去欧洲和亚洲旅行",
    icon: "✈️",
    color: "#E85D04",
  },
  {
    id: "david",
    name: "David Lee",
    age: 48,
    type: "护理者代购型",
    description: "IT项目经理，为72岁父亲购买决策者",
    icon: "👨‍💼",
    color: "#6B6B6B",
  },
  {
    id: "jessica",
    name: "Jessica Brown",
    age: 42,
    type: "机构采购型",
    description: "养老院运营经理，批量采购负责人",
    icon: "🏥",
    color: "#9D4EDD",
  },
];

// Journey stages with detailed data
const journeyStages = [
  {
    id: "trigger",
    name: "触发",
    nameEn: "Trigger",
    icon: "💡",
    duration: "Day 1",
    emotions: ["尴尬", "困惑", "需求"],
    positiveTriggers: ["朋友推荐", "看到广告", "医生建议"],
    negativeTriggers: ["跌倒受伤", "信息过载", "抗拒接受"],
    returnRisk: "低",
    touchpoints: ["Google搜索", "Facebook", "朋友推荐", "YouTube"],
    keyInsight: "触发事件决定了用户旅程的起点和情绪基调",
  },
  {
    id: "awareness",
    name: "认知",
    nameEn: "Awareness",
    icon: "🔍",
    duration: "Day 1-3",
    emotions: ["好奇", "期待", "试探"],
    positiveTriggers: ["广告吸引", "朋友推荐有效", "品牌第一印象好"],
    negativeTriggers: ["广告太多", "不知道相信谁", "产品描述看不懂"],
    returnRisk: "低",
    touchpoints: ["Google搜索结果", "社交媒体广告", "产品页面", "朋友口碑"],
    keyInsight: "此阶段流失主要是信息混乱导致，用户无法判断哪些是真实的",
  },
  {
    id: "research",
    name: "研究",
    nameEn: "Research",
    icon: "📊",
    duration: "Day 4-14",
    emotions: ["谨慎", "认真", "评估"],
    positiveTriggers: ["评价真实", "对比清晰", "视频演示好"],
    negativeTriggers: ["评论造假怀疑", "选项太多", "技术术语难懂", "担心货不对板"],
    returnRisk: "中",
    touchpoints: ["官网", "Amazon评价", "YouTube评测", "Reddit讨论"],
    keyInsight: "这是建立信任的关键阶段，真实用户评价比任何广告都有说服力",
  },
  {
    id: "decision",
    name: "决策",
    nameEn: "Decision",
    icon: "🤔",
    duration: "Day 15-21",
    emotions: ["犹豫", "纠结", "权衡"],
    positiveTriggers: ["客服专业", "优惠价格", "保修政策好", "用户说好"],
    negativeTriggers: ["价格太高", "不知道选哪个型号", "怕买错", "等促销"],
    returnRisk: "中",
    touchpoints: ["产品页", "客服聊天", "邮件咨询", "家人讨论"],
    keyInsight: "客服质量直接影响转化，专业的回答能加速决策",
  },
  {
    id: "purchase",
    name: "购买",
    nameEn: "Purchase",
    icon: "🛒",
    duration: "Day 22-30",
    emotions: ["兴奋", "期待", "焦虑"],
    positiveTriggers: ["下单顺利", "优惠生效", "快速确认"],
    negativeTriggers: ["支付担心", "物流担忧", "后悔怀疑", "等待焦虑"],
    returnRisk: "中",
    touchpoints: ["电商平台", "官网下单", "支付页面", "订单确认"],
    keyInsight: "下单后情绪从兴奋转向焦虑，需要透明及时的物流信息",
  },
  {
    id: "unboxing",
    name: "开箱体验",
    nameEn: "Unboxing",
    icon: "📦",
    duration: "Day 31",
    emotions: ["紧张", "惊喜", "骄傲"],
    positiveTriggers: ["包装精美", "折叠简单", "配件齐全", "说明清晰"],
    negativeTriggers: ["操作失败", "外观不符", "配件缺失", "比想象中重", "说明混乱"],
    returnRisk: "高",
    touchpoints: ["快递", "包装", "说明书", "首次操作", "视频教程"],
    keyInsight: "开箱体验是退货率最高的阶段！折叠失败和预期落差是主要退货原因",
  },
  {
    id: "daily-use",
    name: "日常使用",
    nameEn: "Daily Use",
    icon: "🚶",
    duration: "Day 32-365",
    emotions: ["满意", "习惯", "依赖"],
    positiveTriggers: ["轻便好用", "续航足够", "操作简单", "获得赞美"],
    negativeTriggers: ["续航不足", "质量问题", "售后推诿", "不稳定", "维护困难"],
    returnRisk: "中",
    touchpoints: ["日常场景", "社交分享", "客服", "产品维护"],
    keyInsight: "使用阶段的问题会导致负面评价和口碑受损，续航诚实很重要",
  },
  {
    id: "advocacy",
    name: "口碑传播",
    nameEn: "Advocacy",
    icon: "📣",
    duration: " Ongoing",
    emotions: ["满意", "自豪", "推荐"],
    positiveTriggers: ["产品真的好", "朋友询问", "收到赞美", "客服解决问题"],
    negativeTriggers: ["负面评价", "社交媒体吐槽", "劝退朋友", "品牌伤害"],
    returnRisk: "低",
    touchpoints: ["评价撰写", "社交分享", "口碑推荐", "用户社区"],
    keyInsight: "满意用户会成为品牌大使，但一个差评的影响远超十个好评",
  },
];

// Risk level styling
const getRiskStyle = (risk: string) => {
  switch (risk) {
    case "高":
      return "bg-red-100 text-red-700 border-red-200";
    case "中":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "低":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

// Emotion styling
const getEmotionStyle = (emotion: string) => {
  const positive = ["好奇", "期待", "兴奋", "惊喜", "骄傲", "满意", "自豪"];
  const negative = ["尴尬", "紧张", "焦虑", "犹豫", "纠结"];

  if (negative.includes(emotion)) return "bg-red-50 text-red-600";
  if (positive.includes(emotion)) return "bg-green-50 text-green-600";
  return "bg-gray-50 text-gray-600";
};

export default function UserJourneyPage() {
  const [selectedPersona, setSelectedPersona] = useState(personas[0]);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2AAAA0] via-[#2AAAA0] to-[#259990] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              User Journey Map
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              用户旅程图
              <span className="text-[#F5A623]"> 可视化</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
              探索 GoldSeason 电动轮椅用户的完整旅程，了解每个阶段的情绪变化、
              关键接触点以及可能导致退货的风险点。
            </p>
          </div>
        </div>
      </section>

      {/* Persona Selector */}
      <section className="py-12 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#6B6B6B] text-sm font-medium uppercase tracking-wide mb-4">
            选择您的用户画像
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => {
                  setSelectedPersona(persona);
                  setExpandedStage(null);
                }}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedPersona.id === persona.id
                    ? "border-[#F5A623] bg-[#F5A623]/5 shadow-lg"
                    : "border-[#E8E8E8] hover:border-[#F5A623]/50 bg-white"
                }`}
              >
                <div className="text-3xl mb-2">{persona.icon}</div>
                <h3 className="font-semibold text-[#2D2D2D] text-sm">
                  {persona.name}
                </h3>
                <p className="text-xs text-[#6B6B6B]">{persona.age}岁</p>
                <Badge
                  className="mt-2 text-xs"
                  style={{ backgroundColor: persona.color + "20", color: persona.color }}
                >
                  {persona.type}
                </Badge>
              </button>
            ))}
          </div>

          {/* Selected Persona Description */}
          <div className="mt-6 p-4 bg-[#FAF8F5] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPersona.icon}</span>
              <div>
                <p className="font-medium text-[#2D2D2D]">
                  {selectedPersona.name} — {selectedPersona.type}
                </p>
                <p className="text-sm text-[#6B6B6B]">{selectedPersona.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Risk Warning Banner */}
      <section className="py-6 bg-red-50 border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-red-700">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-semibold">关键发现：开箱体验是退货风险最高的阶段</p>
              <p className="text-sm text-red-600">
                折叠失败、外观不符预期、配件缺失是主要退货原因。产品设计需重点关注"3步学会"的简易操作体验。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Journey Timeline
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">
              {selectedPersona.name} 的用户旅程
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F5A623] via-[#2AAAA0] to-[#2AAAA0] transform -translate-x-1/2 hidden lg:block" />

            {/* Stages */}
            <div className="space-y-8">
              {journeyStages.map((stage, index) => {
                const isExpanded = expandedStage === stage.id;
                const isLeft = index % 2 === 0;

                return (
                  <div key={stage.id} className="relative">
                    {/* Stage Card */}
                    <div
                      className={`lg:flex ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-8`}
                    >
                      {/* Mobile: full width, Desktop: alternating */}
                      <div className="lg:w-1/2">
                        <Card
                          className={`overflow-hidden cursor-pointer transition-all ${
                            isExpanded ? "ring-2 ring-[#F5A623] shadow-xl" : "hover:shadow-lg"
                          }`}
                          onClick={() =>
                            setExpandedStage(isExpanded ? null : stage.id)
                          }
                        >
                          <CardContent className="p-6">
                            {/* Stage Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-4xl">{stage.icon}</span>
                                <div>
                                  <h3 className="text-xl font-bold text-[#2D2D2D]">
                                    {stage.name}
                                    <span className="text-[#6B6B6B] font-normal text-sm ml-2">
                                      {stage.nameEn}
                                    </span>
                                  </h3>
                                  <p className="text-sm text-[#6B6B6B]">{stage.duration}</p>
                                </div>
                              </div>
                              <Badge className={getRiskStyle(stage.returnRisk)}>
                                退货风险: {stage.returnRisk}
                              </Badge>
                            </div>

                            {/* Emotions */}
                            <div className="mb-4">
                              <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-2">
                                情绪变化
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {stage.emotions.map((emotion) => (
                                  <span
                                    key={emotion}
                                    className={`px-3 py-1 rounded-full text-sm ${getEmotionStyle(emotion)}`}
                                  >
                                    {emotion}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Quick Info - Hidden by default, shown when expanded */}
                            {isExpanded && (
                              <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
                                {/* Positive Triggers */}
                                <div>
                                  <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-2">
                                    ✓ 满足时的正面体验
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {stage.positiveTriggers.map((trigger) => (
                                      <span
                                        key={trigger}
                                        className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                                      >
                                        {trigger}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Negative Triggers */}
                                <div>
                                  <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-2">
                                    ✗ 未满足时的负面情绪
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {stage.negativeTriggers.map((trigger) => (
                                      <span
                                        key={trigger}
                                        className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                                      >
                                        {trigger}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Touchpoints */}
                                <div>
                                  <p className="text-xs text-[#6B6B6B] font-medium uppercase tracking-wide mb-2">
                                    接触点
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {stage.touchpoints.map((tp) => (
                                      <span
                                        key={tp}
                                        className="bg-[#FAF8F5] text-[#6B6B6B] px-3 py-1 rounded-full text-sm border border-[#E8E8E8]"
                                      >
                                        {tp}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Key Insight */}
                                <div className="bg-[#F5A623]/10 rounded-xl p-4">
                                  <p className="text-xs text-[#F5A623] font-medium uppercase tracking-wide mb-1">
                                    💡 关键洞察
                                  </p>
                                  <p className="text-sm text-[#2D2D2D]">
                                    {stage.keyInsight}
                                  </p>
                                </div>

                                <Button className="w-full mt-4 bg-[#2AAAA0] hover:bg-[#259990]">
                                  点击收起
                                </Button>
                              </div>
                            )}

                            {/* Expand hint */}
                            {!isExpanded && (
                              <p className="text-xs text-[#6B6B6B] text-center mt-4">
                                点击查看详细分析 ↓
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Spacer for alternating layout */}
                      <div className="hidden lg:block lg:w-1/2" />
                    </div>

                    {/* Timeline Node */}
                    <div
                      className="absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10 hidden lg:block"
                      style={{ backgroundColor: index === 5 ? "#E85D04" : stage.returnRisk === "高" ? "#EF4444" : stage.returnRisk === "中" ? "#F59E0B" : "#10B981" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Return Risk Matrix */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Return Risk Analysis
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">
              退货风险矩阵
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-[#FAF8F5]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2D2D]">
                    阶段
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2D2D]">
                    退货风险
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2D2D]">
                    主要退货原因
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#2D2D2D]">
                    预防措施
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]">
                {journeyStages.map((stage) => (
                  <tr key={stage.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{stage.icon}</span>
                        <span className="font-medium text-[#2D2D2D]">
                          {stage.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getRiskStyle(stage.returnRisk)}>
                        {stage.returnRisk}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {stage.negativeTriggers.slice(0, 3).map((trigger) => (
                          <span
                            key={trigger}
                            className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B6B6B]">
                      {stage.returnRisk === "高" && "简化开箱引导，提供视频教程"}
                      {stage.returnRisk === "中" && "优化客服培训，提供清晰信息"}
                      {stage.returnRisk === "低" && "保持现有服务标准"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Key Insights Section */}
      <section className="py-16 bg-gradient-to-br from-[#F5A623]/10 to-[#2AAAA0]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Product Design Insights
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">
              产品设计关键洞察
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🏆",
                title: "尊严比功能更重要",
                description: "用户不认为自己需要\"轮椅\"，他们需要的是\"保持移动的能力\"。产品定位要强调自由和独立，而非医疗辅助。",
                color: "#2AAAA0",
              },
              {
                icon: "🪶",
                title: "超轻便是第一诉求",
                description: "目标用户无法独自搬运设备是我们的核心突破口。超轻量化（<10kg）是核心竞争力，折叠要简单到3秒以内。",
                color: "#F5A623",
              },
              {
                icon: "⭐",
                title: "社交证明是关键",
                description: "这个群体高度依赖口碑推荐。鼓励用户撰写评价、展示真实案例、建立转介绍奖励计划。",
                color: "#E85D04",
              },
              {
                icon: "👨‍👩‍👧",
                title: "子女是隐形决策者",
                description: "40-55岁子女往往是实际做决策的人。网站要同时满足老年人（用户）和子女（决策者）的需求。",
                color: "#6B6B6B",
              },
              {
                icon: "✈️",
                title: "旅行场景是突破口",
                description: "\"能带上飞机\"是用户购买决策的重要触发点。产品演示和营销内容要重点展示航空携带体验。",
                color: "#9D4EDD",
              },
              {
                icon: "📦",
                title: "开箱体验是退货关键",
                description: "开箱阶段退货率最高！折叠失败和预期落差是主因。产品设计必须确保\"3步学会\"，描述要诚实。",
                color: "#EF4444",
              },
            ].map((insight, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ backgroundColor: insight.color + "20" }}
                  >
                    {insight.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">
                    {insight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F5A623]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
            准备好继续开发了吗？
          </h2>
          <p className="text-lg text-[#2D2D2D]/80 mb-8 max-w-2xl mx-auto">
            基于用户旅程图的分析，我们可以开始优化产品设计和官网用户体验了。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
            >
              查看产品功能优先级
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
            >
              下载完整报告
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}