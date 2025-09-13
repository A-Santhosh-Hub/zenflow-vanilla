import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, FileText, Calendar, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';

export interface Project {
  id: string;
  title: string;
  company: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | 'normal';
  dueDate: string;
  clientName: string;
  clientMobile: string;
  createdAt: string;
  updatedAt: string;
  files: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  lineItems: Array<{
    id: string;
    description: string;
    cost: number;
  }>;
}

const COLUMNS = [
  { id: 'new', title: 'New Work', color: 'bg-primary-light border-primary/20' },
  { id: 'progress', title: 'In Progress', color: 'bg-warning-light border-warning/20' },
  { id: 'feedback', title: 'Awaiting Feedback', color: 'bg-secondary border-border' },
  { id: 'completed', title: 'Completed', color: 'bg-success-light border-success/20' },
  { id: 'archived', title: 'Archived', color: 'bg-muted border-border' },
];

export const KanbanBoard = () => {
  const [projects, setProjects] = useState<Record<string, Project[]>>({
    new: [],
    progress: [],
    feedback: [],
    completed: [],
    archived: [],
  });
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('kanban-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Add some sample projects for demo
      const sampleProjects = {
        new: [
          {
            id: '1',
            title: 'Website Redesign',
            company: 'Tech Startup Inc.',
            description: 'Complete website overhaul with modern design and improved UX',
            priority: 'high' as const,
            dueDate: '2024-01-15',
            clientName: 'John Smith',
            clientMobile: '+1 (555) 123-4567',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: [],
            lineItems: [],
          },
        ],
        progress: [
          {
            id: '2',
            title: 'Mobile App Development',
            company: 'E-Commerce Co.',
            description: 'React Native app for iOS and Android platforms',
            priority: 'medium' as const,
            dueDate: '2024-02-28',
            clientName: 'Sarah Johnson',
            clientMobile: '+1 (555) 987-6543',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            files: [],
            lineItems: [],
          },
        ],
        feedback: [],
        completed: [],
        archived: [],
      };
      setProjects(sampleProjects);
      localStorage.setItem('kanban-projects', JSON.stringify(sampleProjects));
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('kanban-projects', JSON.stringify(projects));
  }, [projects]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = [...projects[source.droppableId]];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      
      setProjects(prev => ({
        ...prev,
        [source.droppableId]: column,
      }));
    } else {
      // Moving between columns
      const sourceColumn = [...projects[source.droppableId]];
      const destColumn = [...projects[destination.droppableId]];
      const [removed] = sourceColumn.splice(source.index, 1);
      
      // Update the project's updatedAt timestamp
      removed.updatedAt = new Date().toISOString();
      
      destColumn.splice(destination.index, 0, removed);
      
      setProjects(prev => ({
        ...prev,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      }));
    }
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      company: '',
      description: '',
      priority: 'normal',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientName: '',
      clientMobile: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
      lineItems: [],
    };
    
    setSelectedProject(newProject);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    if (isCreating) {
      setProjects(prev => ({
        ...prev,
        new: [...prev.new, project],
      }));
      setIsCreating(false);
    } else {
      // Update existing project
      setProjects(prev => {
        const newProjects = { ...prev };
        Object.keys(newProjects).forEach(columnId => {
          newProjects[columnId] = newProjects[columnId].map(p => 
            p.id === project.id ? project : p
          );
        });
        return newProjects;
      });
    }
    
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      Object.keys(newProjects).forEach(columnId => {
        newProjects[columnId] = newProjects[columnId].filter(p => p.id !== projectId);
      });
      return newProjects;
    });
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Project Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your projects with an intuitive Kanban workflow
              </p>
            </div>
            <Button 
              onClick={handleCreateProject}
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {COLUMNS.map(column => (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-xl p-4 mb-4 border`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-foreground">
                      {column.title}
                    </h3>
                    <span className="bg-white/60 text-xs px-2 py-1 rounded-full font-medium">
                      {projects[column.id].length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 min-h-[200px] rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary-light/50' : 'bg-transparent'
                      }`}
                    >
                      {projects[column.id].map((project, index) => (
                        <Draggable 
                          key={project.id} 
                          draggableId={project.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transform transition-transform ${
                                snapshot.isDragging ? 'rotate-2 scale-105' : ''
                              }`}
                            >
                              <ProjectCard
                                project={project}
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsCreating(false);
                                  setIsModalOpen(true);
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Project Modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedProject(null);
              setIsCreating(false);
            }}
            onSave={handleSaveProject}
            onDelete={handleDeleteProject}
          />
        )}
      </div>
    </div>
  );
};