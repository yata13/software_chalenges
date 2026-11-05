import {
  Home, Map, Zap, User, Wrench, Flame, Lightbulb, Timer, Server, Globe, Code2, Layers, Network, Shield,
  Sparkles, Briefcase, Smartphone, X, Check, ChevronLeft, ChevronRight, ArrowRight, RotateCcw, Search,
  Bookmark, Copy, Plus, ExternalLink, Lock, Wifi, Database, Grid3x3, Cloud, ListOrdered, Users, Cpu,
  Play, Trash2, FileText, Star, HardDrive, MemoryStick, Monitor, Laptop, Package, Router, Mail, KeyRound,
  Bug, Eye, Bot, Brain, Plug, Rocket, Target, Building2, Bus, Car, Film, Download, Upload, Gauge,
  MessageSquare, Boxes, Scale, Clock, Banknote, School, Camera, Fingerprint, ShieldAlert, Binary, Hammer,
  Workflow, GraduationCap, TrendingUp, Award, Settings, Image, BatteryFull, CreditCard, Video,
} from 'lucide-react';

// One registry so content files can name icons as plain strings.
export const ICONS = {
  home: Home, map: Map, practice: Zap, profile: User, tools: Wrench, streak: Flame, hint: Lightbulb,
  timer: Timer, server: Server, globe: Globe, code: Code2, layers: Layers, network: Network, shield: Shield,
  ai: Sparkles, jobs: Briefcase, phone: Smartphone, close: X, check: Check, left: ChevronLeft,
  right: ChevronRight, arrow: ArrowRight, replay: RotateCcw, search: Search, bookmark: Bookmark, copy: Copy,
  plus: Plus, external: ExternalLink, lock: Lock, wifi: Wifi, db: Database, cache: Grid3x3, cloud: Cloud,
  queue: ListOrdered, users: Users, cpu: Cpu, play: Play, trash: Trash2, doc: FileText, star: Star,
  disk: HardDrive, ram: MemoryStick, monitor: Monitor, laptop: Laptop, box: Package, router: Router,
  mail: Mail, key: KeyRound, bug: Bug, eye: Eye, bot: Bot, brain: Brain, plug: Plug, rocket: Rocket,
  target: Target, building: Building2, bus: Bus, car: Car, film: Film, download: Download, upload: Upload,
  gauge: Gauge, chat: MessageSquare, boxes: Boxes, scale: Scale, clock: Clock, money: Banknote,
  school: School, camera: Camera, finger: Fingerprint, alert: ShieldAlert, binary: Binary, hammer: Hammer,
  flow: Workflow, grad: GraduationCap, trend: TrendingUp, award: Award, settings: Settings, image: Image,
  battery: BatteryFull, card: CreditCard, video: Video,
} as const;

export type IconName = keyof typeof ICONS;
