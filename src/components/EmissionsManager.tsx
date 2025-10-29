import { useState, useEffect } from 'react';
import { CloudCog, Plus, X, ArrowLeft, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Emission, Hectare } from '../lib/supabase';

type EmissionsManagerProps = {
  onBack: () => void;
};

export default function EmissionsManager({ onBack }: EmissionsManagerProps) {
  const { profile } = useAuth();
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [hectares, setHectares] = useState<Hectare[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hectare_id: '',
    emission_amount: '',
    emission_date: new Date().toISOString().split('T')[0],
    emission_type: 'cultivation' as 'cultivation' | 'harvest' | 'transport' | 'processing',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);

    const [emissionsRes, hectaresRes] = await Promise.all([
      supabase.from('emissions').select('*').eq('user_id', profile.id).order('emission_date', { ascending: false }),
      supabase.from('hectares').select('*').eq('user_id', profile.id).eq('status', 'active')
    ]);

    setEmissions((emissionsRes.data || []) as Emission[]);
    setHectares((hectaresRes.data || []) as Hectare[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await supabase.from('emissions').insert({
      user_id: profile.id,
      hectare_id: formData.hectare_id || null,
      emission_amount: Number(formData.emission_amount),
      emission_date: formData.emission_date,
      emission_type: formData.emission_type,
      notes: formData.notes || null,
    });

    setShowModal(false);
    setFormData({
      hectare_id: '',
      emission_amount: '',
      emission_date: new Date().toISOString().split('T')[0],
      emission_type: 'cultivation',
      notes: '',
    });
    loadData();
  };

  const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.emission_amount), 0);
  const byCultivation = emissions.filter(e => e.emission_type === 'cultivation').reduce((sum, e) => sum + Number(e.emission_amount), 0);
  const byHarvest = emissions.filter(e => e.emission_type === 'harvest').reduce((sum, e) => sum + Number(e.emission_amount), 0);
  const byTransport = emissions.filter(e => e.emission_type === 'transport').reduce((sum, e) => sum + Number(e.emission_amount), 0);
  const byProcessing = emissions.filter(e => e.emission_type === 'processing').reduce((sum, e) => sum + Number(e.emission_amount), 0);

  const getEmissionTypeLabel = (type: string) => {
    switch(type) {
      case 'cultivation': return 'Cultivo';
      case 'harvest': return 'Cosecha';
      case 'transport': return 'Transporte';
      case 'processing': return 'Procesamiento';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
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
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestionar Emisiones</h1>
              <p className="text-slate-600">Registra las emisiones de CO₂ en cada etapa productiva</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition shadow-lg shadow-blue-600/30"
            >
              <Plus className="w-5 h-5" />
              Registrar Emisión
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Total Emisiones</p>
              <p className="text-3xl font-bold text-blue-800">{(totalEmissions / 1000).toFixed(2)}</p>
              <p className="text-xs text-blue-600 mt-1">Toneladas CO₂</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Cultivo</p>
              <p className="text-3xl font-bold text-green-800">{(byCultivation / 1000).toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">Toneladas CO₂</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Cosecha</p>
              <p className="text-3xl font-bold text-yellow-800">{(byHarvest / 1000).toFixed(2)}</p>
              <p className="text-xs text-yellow-600 mt-1">Toneladas CO₂</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <p className="text-sm text-purple-700 mb-1">Transporte + Proc.</p>
              <p className="text-3xl font-bold text-purple-800">{((byTransport + byProcessing) / 1000).toFixed(2)}</p>
              <p className="text-xs text-purple-600 mt-1">Toneladas CO₂</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          ) : emissions.length === 0 ? (
            <div className="text-center py-12">
              <CloudCog className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay emisiones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emissions.map((emission) => {
                const hectare = hectares.find(h => h.id === emission.hectare_id);
                return (
                  <div key={emission.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          emission.emission_type === 'cultivation' ? 'bg-green-100' :
                          emission.emission_type === 'harvest' ? 'bg-yellow-100' :
                          emission.emission_type === 'transport' ? 'bg-orange-100' : 'bg-purple-100'
                        }`}>
                          <Activity className={`w-6 h-6 ${
                            emission.emission_type === 'cultivation' ? 'text-green-700' :
                            emission.emission_type === 'harvest' ? 'text-yellow-700' :
                            emission.emission_type === 'transport' ? 'text-orange-700' : 'text-purple-700'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-slate-800 text-lg">{(emission.emission_amount / 1000).toFixed(2)} t CO₂</h3>
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              emission.emission_type === 'cultivation' ? 'bg-green-100 text-green-700' :
                              emission.emission_type === 'harvest' ? 'bg-yellow-100 text-yellow-700' :
                              emission.emission_type === 'transport' ? 'bg-orange-100 text-orange-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {getEmissionTypeLabel(emission.emission_type)}
                            </span>
                          </div>
                          {hectare && (
                            <p className="text-sm text-slate-600 mb-1">
                              Campo: <span className="font-medium">{hectare.name}</span>
                            </p>
                          )}
                          {emission.notes && (
                            <p className="text-sm text-slate-500">{emission.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 font-medium">
                          {new Date(emission.emission_date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <CloudCog className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Monitoreo Continuo</h3>
              <p className="text-blue-100">
                Registra emisiones en tiempo real para un control preciso de tu huella de carbono y optimiza tus procesos productivos
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Registrar Emisión</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Campo (opcional)</label>
                <select
                  value={formData.hectare_id}
                  onChange={(e) => setFormData({ ...formData, hectare_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Sin campo específico</option>
                  {hectares.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Emisión</label>
                <select
                  value={formData.emission_type}
                  onChange={(e) => setFormData({ ...formData, emission_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="cultivation">Cultivo</option>
                  <option value="harvest">Cosecha</option>
                  <option value="transport">Transporte</option>
                  <option value="processing">Procesamiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad de CO₂ (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.emission_amount}
                  onChange={(e) => setFormData({ ...formData, emission_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.emission_date}
                  onChange={(e) => setFormData({ ...formData, emission_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Registrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
