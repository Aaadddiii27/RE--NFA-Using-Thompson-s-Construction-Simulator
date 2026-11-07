import { Home, Code2, Layers3, GitBranch, FlaskConical, BookOpen } from 'lucide-react';

export type Page = 'home' | 'simulator' | 'steps' | 'visualization' | 'testing';

const items: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'simulator', label: 'Simulator', icon: Code2 },
  { id: 'steps', label: 'Construction Steps', icon: Layers3 },
  { id: 'visualization', label: 'NFA Visualization', icon: GitBranch },
  { id: 'testing', label: 'String Testing', icon: FlaskConical }
];

interface Props {
  active: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><BookOpen size={21} /></div>
        <div><strong>RE → ε-NFA</strong><span>SIMULATOR</span></div>
      </div>
      <nav>
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
              <Icon size={18} /><span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-note"><span className="status-dot" /> Browser-based · No backend</div>
    </aside>
  );
}