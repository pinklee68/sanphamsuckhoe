import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export default function LucideIcon({ name, className = '', size = 20, color }: LucideIconProps) {
  // Safe lookup for the icon component
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  
  return <IconComponent className={className} size={size} color={color} />;
}
