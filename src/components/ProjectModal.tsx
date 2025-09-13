import { useState, useRef } from 'react';
import { X, Save, Trash2, Upload, Download, Eye, Plus, Printer, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from './KanbanBoard';

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectModal = ({ project, isOpen, onClose, onSave, onDelete }: ProjectModalProps) => {
  const [editedProject, setEditedProject] = useState<Project>(project);
  const [activeTab, setActiveTab] = useState('details');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedProject = {
      ...editedProject,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedProject);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const newFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        url: url,
      };

      setEditedProject(prev => ({
        ...prev,
        files: [...prev.files, newFile],
      }));
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setEditedProject(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId),
    }));
  };

  const handleAddLineItem = () => {
    const newLineItem = {
      id: Date.now().toString(),
      description: '',
      cost: 0,
    };
    setEditedProject(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newLineItem],
    }));
  };

  const handleUpdateLineItem = (id: string, field: 'description' | 'cost', value: string | number) => {
    setEditedProject(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveLineItem = (id: string) => {
    setEditedProject(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  };

  const getTotalCost = () => {
    return editedProject.lineItems.reduce((sum, item) => sum + item.cost, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handlePrintBill = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${editedProject.title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .client-info { margin-bottom: 30px; }
            .line-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .line-items th, .line-items td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; }
            .company-info { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice</h1>
            <h2>${editedProject.title}</h2>
          </div>
          
          <div class="company-info">
            <h3>From:</h3>
            <p><strong>Company:</strong> ${editedProject.company}</p>
          </div>
          
          <div class="client-info">
            <h3>To:</h3>
            <p><strong>Client:</strong> ${editedProject.clientName}</p>
            <p><strong>Mobile:</strong> ${editedProject.clientMobile}</p>
          </div>
          
          <table class="line-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${editedProject.lineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${formatCurrency(item.cost)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            Total: ${formatCurrency(getTotalCost())}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">
              {editedProject.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {editedProject.company || 'No Company'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDelete(editedProject.id)}
              className="border-destructive text-destructive hover:bg-destructive-light"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4 grid w-fit grid-cols-3">
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="files">Files & Documents</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="details" className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={editedProject.title}
                      onChange={(e) => setEditedProject(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={editedProject.company}
                      onChange={(e) => setEditedProject(prev => ({ ...prev, company: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={editedProject.priority} 
                      onValueChange={(value: any) => setEditedProject(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={editedProject.dueDate}
                      onChange={(e) => setEditedProject(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={editedProject.description}
                    onChange={(e) => setEditedProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the project..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={editedProject.clientName}
                      onChange={(e) => setEditedProject(prev => ({ ...prev, clientName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientMobile">Client Mobile</Label>
                    <Input
                      id="clientMobile"
                      value={editedProject.clientMobile}
                      onChange={(e) => setEditedProject(prev => ({ ...prev, clientMobile: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Created:</strong> {new Date(editedProject.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div>
                    <strong>Last Updated:</strong> {new Date(editedProject.updatedAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-6">
                {/* File Upload */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Files & Documents</Label>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* File List */}
                  {editedProject.files.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No files uploaded yet</p>
                      <p className="text-sm">Click "Upload Files" to add documents</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {editedProject.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <span className="font-medium">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = file.url;
                                a.download = file.name;
                                a.click();
                              }}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRemoveFile(file.id)}
                              className="text-destructive hover:bg-destructive-light"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Line Items</Label>
                    <Button onClick={handleAddLineItem} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Line Item
                    </Button>
                  </div>

                  {editedProject.lineItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No line items added yet</p>
                      <p className="text-sm">Click "Add Line Item" to start building your invoice</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editedProject.lineItems.map(item => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
                          <Input
                            placeholder="Description..."
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            className="flex-1"
                          />
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.cost}
                              onChange={(e) => handleUpdateLineItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                              className="w-28 pl-8"
                            />
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  {editedProject.lineItems.length > 0 && (
                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          Total: {formatCurrency(getTotalCost())}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Print Bill */}
                {editedProject.lineItems.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handlePrintBill} className="bg-primary hover:bg-primary-hover">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Invoice
                    </Button>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};