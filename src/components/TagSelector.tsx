import { useState } from 'react';
import { Check, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TagBadge } from './TagBadge';
import { useLeadTags } from '@/hooks/useLeadTags';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTags: Array<{ id: string; name: string; color: string }>;
  onTagsChange: (tags: Array<{ id: string; name: string; color: string }>) => void;
  placeholder?: string;
}

const TAG_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F97316', '#84CC16', '#06B6D4', '#6366F1'
];

export const TagSelector = ({ selectedTags = [], onTagsChange, placeholder = "Selecionar tags..." }: TagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null);
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const { tags = [], createTag, updateTag, deleteTag, loading } = useLeadTags();
  const { hasCompany } = useCurrentUser();
  
  // Disable tag management if user doesn't have a company configured
  const isTagManagementDisabled = !hasCompany;

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    const createdTag = await createTag({
      name: newTagName.trim(),
      color: newTagColor
    });
    
    if (createdTag) {
      onTagsChange([...selectedTags, createdTag]);
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
      setShowCreateForm(false);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !editingTag.name.trim()) return;
    
    const updatedTag = await updateTag(editingTag.id, {
      name: editingTag.name.trim(),
      color: editingTag.color
    });
    
    if (updatedTag) {
      // Atualizar tags selecionadas se a tag editada estiver incluída
      const updatedSelectedTags = selectedTags.map(tag => 
        tag.id === editingTag.id ? updatedTag : tag
      );
      onTagsChange(updatedSelectedTags);
      setEditingTag(null);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    await deleteTag(tagToDelete.id);
    
    // Remover tag das selecionadas se estiver incluída
    const updatedSelectedTags = selectedTags.filter(tag => tag.id !== tagToDelete.id);
    onTagsChange(updatedSelectedTags);
    setTagToDelete(null);
  };

  const handleToggleTag = (tag: { id: string; name: string; color: string }) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchValue.toLowerCase()) &&
    !selectedTags.some(t => t.id === tag.id)
  );

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={() => handleRemoveTag(tag.id)}
            />
          ))}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left font-normal"
          >
            {selectedTags.length > 0 ? `${selectedTags.length} tag(s) selecionada(s)` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar tags..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">Nenhuma tag encontrada</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                    className="gap-2"
                    disabled={isTagManagementDisabled}
                  >
                    <Plus className="w-4 h-4" />
                    {isTagManagementDisabled ? 'Configure sua empresa primeiro' : 'Criar nova tag'}
                  </Button>
                </div>
              </CommandEmpty>
              
              {!showCreateForm && !editingTag && (
                <CommandGroup>
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      className="flex items-center gap-2 group"
                    >
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 cursor-pointer" onClick={() => handleToggleTag(tag)}>
                        {tag.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          disabled={isTagManagementDisabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTag({ id: tag.id, name: tag.name, color: tag.color });
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          disabled={isTagManagementDisabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTagToDelete({ id: tag.id, name: tag.name });
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <Check
                        className={cn(
                          "w-4 h-4",
                          selectedTags.some(t => t.id === tag.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                  
                  {filteredTags.length > 0 && !isTagManagementDisabled && (
                    <CommandItem onSelect={() => setShowCreateForm(true)} className="border-t">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar nova tag
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
            
            {/* Formulário de criação */}
            {showCreateForm && (
              <div className="p-3 border-t">
                <div className="space-y-3">
                  <Input
                    placeholder="Nome da tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Cor da tag
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewTagColor(color)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            newTagColor === color ? "border-gray-400 scale-110" : "border-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                    >
                      Criar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTagName('');
                        setNewTagColor(TAG_COLORS[0]);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário de edição */}
            {editingTag && (
              <div className="p-3 border-t">
                <div className="space-y-3">
                  <Input
                    placeholder="Nome da tag"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEditTag();
                      }
                    }}
                  />
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Cor da tag
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditingTag({ ...editingTag, color })}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            editingTag.color === color ? "border-gray-400 scale-110" : "border-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEditTag}
                      disabled={!editingTag.name.trim()}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTag(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog de confirmação para deletar tag */}
      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a tag "{tagToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};