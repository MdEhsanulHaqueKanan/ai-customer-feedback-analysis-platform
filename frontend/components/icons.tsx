import {
  Twitter,
  Apple,
  MessageSquare,
  ArrowDown,
  ArrowUp,
  Send,
  Loader,
  Bot,
  User,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  LayoutDashboard,
  BotMessageSquare,
  Grid,
  Plus,
  FileText,
  Database // <-- 1. IMPORT THE NEW ICON
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';

export const Icons = {
  twitter: (props: LucideProps) => <Twitter {...props} />,
  appStore: (props: LucideProps) => <Apple {...props} />,
  supportTicket: (props: LucideProps) => <MessageSquare {...props} />,
  arrowDown: (props: LucideProps) => <ArrowDown {...props} />,
  arrowUp: (props: LucideProps) => <ArrowUp {...props} />,
  send: (props: LucideProps) => <Send {...props} />,
  loader: (props: LucideProps) => <Loader {...props} />,
  bot: (props: LucideProps) => <Bot {...props} />,
  user: (props: LucideProps) => <User {...props} />,
  image: (props: LucideProps) => <ImageIcon {...props} />,
  video: (props: LucideProps) => <VideoIcon {...props} />,
  close: (props: LucideProps) => <X {...props} />,
  dashboard: (props: LucideProps) => <LayoutDashboard {...props} />,
  assistant: (props: LucideProps) => <BotMessageSquare {...props} />,
  media: (props: LucideProps) => <Grid {...props} />,
  plus: (props: LucideProps) => <Plus {...props} />,
  document: (props: LucideProps) => <FileText {...props} />,
  // --- 2. ADD THE NEW ICON TO THE EXPORTED OBJECT ---
  dataset: (props: LucideProps) => <Database {...props} />,
};