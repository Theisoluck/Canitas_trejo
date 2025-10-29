import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Hectare } from '../lib/supabase';

type HectaresManagerProps = {
  onBack: () => void;
};

export default function HectaresManager({ onBack }: HectaresManagerProps) {
  const { profile } = useAuth();
  const [hectares, setHectares] = useState<Hectare[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    location: '',
    status: 'active' as 'active' | 'inactive' | 'harvested',
  });

  useEffect(() => {
    loadHectares();
  }, []);

  const loadHectares = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('hectares')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setHectares((data || []) as Hectare[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const payload = {
      user_id: profile.id,
      name: formData.name,
      size: Number(formData.size),
      location: formData.location,
      status: formData.status,
    };

    if (editingId) {
      await supabase.from('hectares').update(payload).eq('id', editingId);
    } else {
      await supabase.from('hectares').insert(payload);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', size: '', location: '', status: 'active' });
    loadHectares();
  };

  const handleEdit = (hectare: Hectare) => {
    setEditingId(hectare.id);
    setFormData({
      name: hectare.name,
      size: hectare.size.toString(),
      location: hectare.location || '',
      status: hectare.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta hectárea?')) {
      await supabase.from('hectares').delete().eq('id', id);
      loadHectares();
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', size: '', location: '', status: 'active' });
    setShowModal(true);
  };

  const totalSize = hectares.reduce((sum, h) => sum + Number(h.size), 0);
  const activeCount = hectares.filter(h => h.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestionar Hectáreas</h1>
              <p className="text-slate-600">Administra tus campos de caña de azúcar</p>
            </div>
            <button
              onClick={openNewModal}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition shadow-lg shadow-green-600/30"
            >
              <Plus className="w-5 h-5" />
              Nueva Hectárea
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Total Hectáreas</p>
              <p className="text-4xl font-bold text-green-800">{totalSize.toFixed(1)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Campos Registrados</p>
              <p className="text-4xl font-bold text-blue-800">{hectares.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <p className="text-sm text-emerald-700 mb-1">Campos Activos</p>
              <p className="text-4xl font-bold text-emerald-800">{activeCount}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
            </div>
          ) : hectares.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay hectáreas registradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hectares.map((hectare) => (
                <div key={hectare.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{hectare.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          hectare.status === 'active' ? 'bg-green-100 text-green-700' :
                          hectare.status === 'harvested' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {hectare.status === 'active' ? 'Activo' : hectare.status === 'harvested' ? 'Cosechado' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(hectare)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(hectare.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium">Tamaño:</span> {hectare.size} ha
                    </p>
                    {hectare.location && (
                      <p className="text-slate-600">
                        <span className="font-medium">Ubicación:</span> {hectare.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingId ? 'Editar Hectárea' : 'Nueva Hectárea'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Campo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tamaño (hectáreas)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="active">Activo</option>
                  <option value="harvested">Cosechado</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
