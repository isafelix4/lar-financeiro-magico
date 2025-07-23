import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Edit } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useToast } from "@/hooks/use-toast";
import type { Category, Subcategory } from "@/types/financial";

const Configuracoes = () => {
  const { categories, addCategory, updateCategory, deleteCategory, addSubcategory, deleteSubcategory } = useFinancialData();
  const { toast } = useToast();
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"receita" | "despesa">("despesa");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    addCategory({
      name: newCategoryName,
      type: newCategoryType,
      subcategories: []
    });

    setNewCategoryName("");
    toast({
      title: "Sucesso",
      description: "Categoria criada com sucesso"
    });
  };

  const handleAddSubcategory = () => {
    if (!newSubcategoryName.trim() || !selectedCategoryForSub) {
      toast({
        title: "Erro",
        description: "Nome da subcategoria e categoria são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    addSubcategory(selectedCategoryForSub, {
      name: newSubcategoryName
    });

    setNewSubcategoryName("");
    setSelectedCategoryForSub("");
    toast({
      title: "Sucesso",
      description: "Subcategoria criada com sucesso"
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    toast({
      title: "Sucesso",
      description: "Categoria removida com sucesso"
    });
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    deleteSubcategory(categoryId, subcategoryId);
    toast({
      title: "Sucesso",
      description: "Subcategoria removida com sucesso"
    });
  };

  const handleEditCategory = (categoryId: string, newName: string) => {
    if (!newName.trim()) return;
    
    updateCategory(categoryId, { name: newName });
    setEditingCategory(null);
    setEditCategoryName("");
    toast({
      title: "Sucesso",
      description: "Categoria atualizada com sucesso"
    });
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.name);
  };

  const despenseCategories = categories.filter(cat => cat.type === 'despesa');
  const receiptCategories = categories.filter(cat => cat.type === 'receita');

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-foreground">Configurações</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adicionar Nova Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Educação"
              />
            </div>
            
            <div>
              <Label htmlFor="category-type">Tipo</Label>
              <Select value={newCategoryType} onValueChange={(value: "receita" | "despesa") => setNewCategoryType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddCategory} className="w-full">
              Criar Categoria
            </Button>
          </CardContent>
        </Card>

        {/* Adicionar Nova Subcategoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Subcategoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subcategory-category">Categoria</Label>
              <Select value={selectedCategoryForSub} onValueChange={setSelectedCategoryForSub}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subcategory-name">Nome da Subcategoria</Label>
              <Input
                id="subcategory-name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Ex: Mensalidade"
              />
            </div>

            <Button onClick={handleAddSubcategory} className="w-full">
              Criar Subcategoria
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Categorias de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Categorias de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {despenseCategories.map(category => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onBlur={() => handleEditCategory(category.id, editCategoryName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory(category.id, editCategoryName);
                          }
                          if (e.key === 'Escape') {
                            setEditingCategory(null);
                            setEditCategoryName("");
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h4 className="font-medium text-foreground">{category.name}</h4>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {category.subcategories.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>• {subcategory.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias de Receitas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Categorias de Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {receiptCategories.map(category => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onBlur={() => handleEditCategory(category.id, editCategoryName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory(category.id, editCategoryName);
                          }
                          if (e.key === 'Escape') {
                            setEditingCategory(null);
                            setEditCategoryName("");
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h4 className="font-medium text-foreground">{category.name}</h4>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {category.subcategories.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>• {subcategory.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;