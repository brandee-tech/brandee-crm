import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Key, Plus, Trash2, Copy, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    created_at: string;
    last_used_at: string | null;
    is_active: boolean;
}

export const ApiKeysSettings = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { company } = useCurrentCompany();
    const { toast } = useToast();

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const { data, error } = await supabase
                .from('api_keys' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setKeys(data || []);
        } catch (error) {
            console.error('Error fetching API keys:', error);
            toast({
                title: "Erro ao carregar chaves",
                description: "Não foi possível carregar as chaves de API.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const generateKey = async () => {
        // Generate a random key
        const array = new Uint8Array(24);
        crypto.getRandomValues(array);
        const randomString = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
        return `sk_live_${randomString}`;
    };

    const hashKey = async (key: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(key);
        const hash = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        setIsSubmitting(true);
        try {
            const key = await generateKey();
            const hashedKey = await hashKey(key);
            const prefix = key.substring(0, 12) + '...';

            const { error } = await supabase
                .from('api_keys' as any)
                .insert({
                    company_id: company?.id,
                    name: newKeyName,
                    key_hash: hashedKey,
                    prefix: prefix,
                    is_active: true
                });

            if (error) throw error;

            setCreatedKey(key);
            fetchKeys();
            toast({
                title: "Chave criada com sucesso",
                description: "Copie sua chave agora, você não poderá vê-la novamente.",
            });
        } catch (error) {
            console.error('Error creating API key:', error);
            toast({
                title: "Erro ao criar chave",
                description: "Não foi possível criar a chave de API.",
                variant: "destructive",
            });
            setIsCreateOpen(false); // Close if error, or keep open? keep open to retry usually
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeKey = async (id: string) => {
        try {
            const { error } = await supabase
                .from('api_keys' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setKeys(keys.filter(k => k.id !== id));
            toast({
                title: "Chave revogada",
                description: "A chave de API foi removida e não funcionará mais.",
            });
        } catch (error) {
            console.error('Error revoking API key:', error);
            toast({
                title: "Erro ao revogar chave",
                description: "Não foi possível remover a chave de API.",
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copiado!",
            description: "Chave copiada para a área de transferência.",
        });
    };

    const handleCloseDialog = () => {
        setIsCreateOpen(false);
        setCreatedKey(null);
        setNewKeyName('');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            Chaves de API
                        </CardTitle>
                        <CardDescription>
                            Gerencie as chaves de acesso para integração com sistemas externos via API.
                        </CardDescription>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Chave
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Nova Chave de API</DialogTitle>
                                <DialogDescription>
                                    Dê um nome para identificar esta chave (ex: Zapier, Website, Integração ERP).
                                </DialogDescription>
                            </DialogHeader>

                            {!createdKey ? (
                                <form onSubmit={handleCreateKey} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="keyName">Nome da Chave</Label>
                                        <Input
                                            id="keyName"
                                            placeholder="Ex: Integração Zapier"
                                            value={newKeyName}
                                            onChange={(e) => setNewKeyName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={handleCloseDialog}>Cancelar</Button>
                                        <Button type="submit" disabled={!newKeyName.trim() || isSubmitting}>
                                            {isSubmitting ? 'Criando...' : 'Criar Chave'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Atenção</AlertTitle>
                                        <AlertDescription>
                                            Esta é a única vez que você verá esta chave. Copie-a e guarde-a em um local seguro.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="p-4 bg-muted rounded-md relative group">
                                        <code className="text-sm break-all">{createdKey}</code>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => copyToClipboard(createdKey)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <DialogFooter>
                                        <Button onClick={handleCloseDialog}>Concluído</Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhuma chave de API ativa.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Prefixo</TableHead>
                                <TableHead>Último Uso</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keys.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{key.prefix}</TableCell>
                                    <TableCell>
                                        {key.last_used_at
                                            ? format(new Date(key.last_used_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })
                                            : 'Nunca'}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(key.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRevokeKey(key.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
