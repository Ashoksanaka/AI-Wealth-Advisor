import {
  BarChart3,
  Bot,
  PieChart,
  CreditCard,
  Smartphone,
  Zap,
  Users,
  Shield,
  Star,
  Target,
} from "lucide-react";

export const statsData = [
  {
    value: "24/7",
    label: "AI Advisory",
    icon: Bot,
  },
  {
    value: "100%",
    label: "Personalized Insights",
    icon: Zap,
  },
  {
    value: "Bank-Grade",
    label: "Security",
    icon: Shield,
  },
  {
    value: "Scalable",
    label: "Wealth Guidance",
    icon: Star,
  },
];

export const featuresData = [
  {
    icon: Bot,
    title: "Avatar Wealth Advisor",
    description:
      "Chat with Arya, your AI digital wealth advisor, for personalized guidance based on your real financial data.",
  },
  {
    icon: BarChart3,
    title: "Behavioral Spending Analysis",
    description:
      "Understand spending habits with category breakdowns, trends, and savings rate tracking.",
  },
  {
    icon: PieChart,
    title: "Portfolio & Goal Tracking",
    description:
      "Monitor investments, asset allocation, and progress toward retirement, emergency, and custom goals.",
  },
  {
    icon: Zap,
    title: "Personalized AI Insights",
    description:
      "Receive timely, data-driven recommendations powered by NVIDIA AI on your dashboard.",
  },
  {
    icon: CreditCard,
    title: "Receipt Intelligence",
    description:
      "Extract transaction data automatically from receipts using advanced AI vision technology.",
  },
  {
    icon: Smartphone,
    title: "Mobile-Ready Integration",
    description:
      "REST API layer designed for seamless embedding into your bank's mobile application.",
  },
];

export const howItWorksData = [
  {
    icon: CreditCard,
    title: "1. Connect Your Accounts",
    description:
      "Link bank accounts and build your wealth profile with risk tolerance and goals.",
  },
  {
    icon: BarChart3,
    title: "2. Track Spending & Investments",
    description:
      "Automatically categorize transactions and monitor your portfolio allocation.",
  },
  {
    icon: Target,
    title: "3. Chat with Arya",
    description:
      "Get scalable, personalized wealth advisory through your intuitive digital interface.",
  },
];

export const testimonialsData = [
  {
    name: "Priya Sharma",
    role: "Bank Customer",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "Arya helped me understand my spending patterns and suggested how to rebalance my portfolio — all from my banking app.",
  },
  {
    name: "Rajesh Kumar",
    role: "Young Professional",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The AI insights flagged my budget overrun before month-end. Having a digital wealth advisor in the bank app is a game changer.",
  },
  {
    name: "Anita Desai",
    role: "Retirement Planner",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "Finally, wealth advisory that scales. Personalized guidance based on my actual spending and investment behavior — not generic tips.",
  },
];
