import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, Search, UserCheck, UserX } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserManagerProps {
  onBack: () => void;
  onViewOperator: (operatorId: string) => void;
}

export default function UserManager({ onBack, onViewOperator }: UserManagerProps) {
  const { profile: adminProfile } = useAuth();
  const [operators, setOperators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    is_active: true,
  });

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'operator')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOperators(data || []);
    } catch (error) {
      console.error('Error loading operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: 'operator',
            created_by: adminProfile?.id,
            is_active: formData.is_active,
          });

        if (profileError) throw profileError;
      }

      setShowModal(false);
      setFormData({ email: '', password: '', full_name: '', is_active: true });
      loadOperators();
    } catch (error) {
      console.error('Error creating operator:', error);
      alert('Error al crear operador. Verifica que el email no esté registrado.');
    }
  };

  const handleUpdateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperator) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          is_active: formData.is_active,
        })
        .eq('id', editingOperator.id);

      if (error) throw error;

      setShowModal(false);
      setEditingOperator(null);
      setFormData({ email: '', password: '', full_name: '', is_active: true });
      loadOperators();
    } catch (error) {
      console.error('Error updating operator:', error);
      alert('Error al actualizar operador.');
    }
  };

  const handleDeleteOperator = async (operatorId: string) => {
    if (!confirm('¿Estás seguro de eliminar este operador? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', operatorId);

      if (error) throw error;
      loadOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
      alert('Error al eliminar operador.');
    }
  };

  const openCreateModal = () => {
    setEditingOperator(null);
    setFormData({ email: '', password: '', full_name: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (operator: Profile) => {
    setEditingOperator(operator);
    setFormData({
      email: operator.email,
      password: '',
      full_name: operator.full_name || '',
      is_active: operator.is_active ?? true,
    });
    setShowModal(true);
  };

  const filteredOperators = operators.filter(op =>
    op.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Crear Operador
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Operadores</h2>
          <p className="text-slate-600">Administra las cuentas de operadores del sistema</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando operadores...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Fecha Creación</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOperators.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        {searchTerm ? 'No se encontraron operadores' : 'No hay operadores registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredOperators.map((operator) => (
                      <tr key={operator.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm text-slate-800">
                          {operator.full_name || 'Sin nombre'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{operator.email}</td>
                        <td className="px-6 py-4">
                          {operator.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <UserCheck className="w-3 h-3" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              <UserX className="w-3 h-3" />
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(operator.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onViewOperator(operator.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(operator)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOperator(operator.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              {editingOperator ? 'Editar Operador' : 'Crear Nuevo Operador'}
            </h3>
            <form onSubmit={editingOperator ? handleUpdateOperator : handleCreateOperator}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {!editingOperator && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                    Usuario activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOperator(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingOperator ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
