import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Coins, CloudCog, User, Calendar } from 'lucide-react';
import { supabase, Profile, Hectare, Token, Emission } from '../lib/supabase';

interface OperatorDetailsProps {
  operatorId: string;
  onBack: () => void;
}

interface OperatorStats {
  totalHectares: number;
  activeHectares: number;
  totalTokens: number;
  totalEmissions: number;
  hectares: Hectare[];
  tokens: Token[];
  emissions: Emission[];
}

export default function OperatorDetails({ operatorId, onBack }: OperatorDetailsProps) {
  const [operator, setOperator] = useState<Profile | null>(null);
  const [stats, setStats] = useState<OperatorStats>({
    totalHectares: 0,
    activeHectares: 0,
    totalTokens: 0,
    totalEmissions: 0,
    hectares: [],
    tokens: [],
    emissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hectares' | 'tokens' | 'emissions'>('hectares');

  useEffect(() => {
    loadOperatorData();
  }, [operatorId]);

  const loadOperatorData = async () => {
    try {
      const [profileRes, hectaresRes, tokensRes, emissionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', operatorId).maybeSingle(),
        supabase.from('hectares').select('*').eq('user_id', operatorId),
        supabase.from('tokens').select('*').eq('user_id', operatorId),
        supabase.from('emissions').select('*').eq('user_id', operatorId),
      ]);

      if (profileRes.error) throw profileRes.error;
      setOperator(profileRes.data);

      const hectares = (hectaresRes.data || []) as Hectare[];
      const tokens = (tokensRes.data || []) as Token[];
      const emissions = (emissionsRes.data || []) as Emission[];

      const totalHectares = hectares.reduce((sum, h) => sum + Number(h.size), 0);
      const activeHectares = hectares.filter(h => h.status === 'active').length;
      const totalTokens = tokens.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.emission_amount), 0);

      setStats({
        totalHectares,
        activeHectares,
        totalTokens,
        totalEmissions,
        hectares,
        tokens,
        emissions,
      });
    } catch (error) {
      console.error('Error loading operator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmissionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cultivation: 'Cultivo',
      harvest: 'Cosecha',
      transport: 'Transporte',
      processing: 'Procesamiento',
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      active: 'Activa',
      inactive: 'Inactiva',
      harvested: 'Cosechada',
    };
    return statuses[status] || status;
  };

  const getTokenTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      earned: 'Ganado',
      purchased: 'Comprado',
      retired: 'Retirado',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Cargando datos del operador...</p>
      </div>
    );
  }

  if (!operator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Operador no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Operadores
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-4 rounded-xl">
              <User className="w-8 h-8 text-blue-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">{operator.full_name}</h2>
              <p className="text-slate-600 mb-3">{operator.email}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${operator.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {operator.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Registrado: {new Date(operator.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-sm text-slate-600">Hectáreas</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalHectares.toFixed(1)}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.activeHectares} activas</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-700" />
              </div>
              <p className="text-sm text-slate-600">Tokens</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalTokens.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.tokens.length} transacciones</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <CloudCog className="w-5 h-5 text-red-700" />
              </div>
              <p className="text-sm text-slate-600">Emisiones</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{(stats.totalEmissions / 1000).toFixed(1)}</p>
            <p className="text-xs text-slate-500 mt-1">Toneladas CO₂</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CloudCog className="w-5 h-5 text-blue-700" />
              </div>
              <p className="text-sm text-slate-600">Registros</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.emissions.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total emisiones</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('hectares')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'hectares'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Hectáreas ({stats.hectares.length})
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'tokens'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tokens ({stats.tokens.length})
              </button>
              <button
                onClick={() => setActiveTab('emissions')}
                className={`flex-1 px-6 py-4 font-medium transition ${
                  activeTab === 'emissions'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Emisiones ({stats.emissions.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'hectares' && (
              <div className="space-y-4">
                {stats.hectares.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No hay hectáreas registradas</p>
                ) : (
                  stats.hectares.map((hectare) => (
                    <div key={hectare.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-1">{hectare.name}</h4>
                          <p className="text-sm text-slate-600 mb-2">{hectare.location || 'Sin ubicación'}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-slate-700">
                              <strong>{Number(hectare.size).toFixed(1)}</strong> hectáreas
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              hectare.status === 'active' ? 'bg-green-100 text-green-700' :
                              hectare.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {getStatusLabel(hectare.status)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(hectare.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="space-y-4">
                {stats.tokens.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No hay tokens registrados</p>
                ) : (
                  stats.tokens.map((token) => (
                    <div key={token.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              token.token_type === 'earned' ? 'bg-green-100 text-green-700' :
                              token.token_type === 'purchased' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getTokenTypeLabel(token.token_type)}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">
                            {Number(token.amount).toFixed(2)} tokens
                          </p>
                          <p className="text-sm text-slate-600">
                            Valor: ${Number(token.value).toFixed(2)}
                          </p>
                          {token.blockchain_tx && (
                            <p className="text-xs text-slate-500 mt-1 font-mono truncate max-w-md">
                              TX: {token.blockchain_tx}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(token.transaction_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'emissions' && (
              <div className="space-y-4">
                {stats.emissions.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No hay emisiones registradas</p>
                ) : (
                  stats.emissions.map((emission) => (
                    <div key={emission.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              emission.emission_type === 'cultivation' ? 'bg-green-100 text-green-700' :
                              emission.emission_type === 'harvest' ? 'bg-yellow-100 text-yellow-700' :
                              emission.emission_type === 'transport' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getEmissionTypeLabel(emission.emission_type)}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800">
                            {Number(emission.emission_amount).toFixed(2)} kg CO₂
                          </p>
                          {emission.notes && (
                            <p className="text-sm text-slate-600 mt-1">{emission.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(emission.emission_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
