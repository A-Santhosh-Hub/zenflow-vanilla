import { Calendar, Building, Flag, FileText } from 'lucide-react';
import { Project } from './KanbanBoard';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const priorityConfig = {
  high: { 
    color: 'bg-priority-high text-white', 
    label: 'High Priority',
    icon: '🔴'
  },
  medium: { 
    color: 'bg-priority-medium text-white', 
    label: 'Medium',
    icon: '🟡' 
  },
  low: { 
    color: 'bg-priority-low text-white', 
    label: 'Low',
    icon: '🟢' 
  },
  normal: { 
    color: 'bg-priority-normal text-white', 
    label: 'Normal',
    icon: '⚪' 
  },
};

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = new Date(project.dueDate) < new Date();
  const priority = priorityConfig[project.priority];

  return (
    <div 
      onClick={onClick}
      className="bg-card border border-card-border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-card-foreground mb-1 line-clamp-2">
            {project.title}
          </h4>
          <div className="flex items-center text-muted-foreground text-xs">
            <Building className="w-3 h-3 mr-1" />
            <span className="truncate">{project.company || 'No Company'}</span>
          </div>
        </div>
        
        <div className={`${priority.color} px-2 py-1 rounded-md text-xs font-medium shrink-0 ml-2`}>
          <span className="mr-1">{priority.icon}</span>
          {priority.label}
        </div>
      </div>

      {/* Description Preview */}
      {project.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Calendar className="w-3 h-3 mr-1" />
          <span>{formatDate(project.dueDate)}</span>
          {isOverdue && <span className="ml-1 text-destructive">⚠️</span>}
        </div>

        {project.files.length > 0 && (
          <div className="flex items-center text-muted-foreground">
            <FileText className="w-3 h-3 mr-1" />
            <span>{project.files.length}</span>
          </div>
        )}
      </div>

      {/* Client Info Preview */}
      {project.clientName && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Client: {project.clientName}
          </span>
        </div>
      )}
    </div>
  );
};