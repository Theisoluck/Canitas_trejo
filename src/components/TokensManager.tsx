import { useState, useEffect } from 'react';
import { Coins, Plus, TrendingUp, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Token } from '../lib/supabase';

type TokensManagerProps = {
  onBack: () => void;
};

export default function TokensManager({ onBack }: TokensManagerProps) {
  const { profile } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    token_type: 'earned' as 'earned' | 'purchased' | 'retired',
    value: '',
    blockchain_tx: '',
  });

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_id', profile.id)
      .order('transaction_date', { ascending: false });
    setTokens((data || []) as Token[]);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await supabase.from('tokens').insert({
      user_id: profile.id,
      amount: Number(formData.amount),
      token_type: formData.token_type,
      value: Number(formData.value),
      blockchain_tx: formData.blockchain_tx || null,
    });

    setShowModal(false);
    setFormData({ amount: '', token_type: 'earned', value: '', blockchain_tx: '' });
    loadTokens();
  };

  const totalTokens = tokens.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalValue = tokens.reduce((sum, t) => sum + Number(t.value), 0);
  const earnedTokens = tokens.filter(t => t.token_type === 'earned').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-amber-50 p-6">
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
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestionar Tokens y Ganancias</h1>
              <p className="text-slate-600">Administra tus créditos de carbono y transacciones</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-6 py-3 rounded-lg transition shadow-lg shadow-yellow-600/30"
            >
              <Plus className="w-5 h-5" />
              Registrar Token
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Total Tokens</p>
              <p className="text-4xl font-bold text-yellow-800">{totalTokens.toFixed(0)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-green-700 mb-1">Tokens Ganados</p>
              <p className="text-4xl font-bold text-green-800">{earnedTokens.toFixed(0)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <p className="text-sm text-emerald-700 mb-1">Valor Total (USD)</p>
              <p className="text-4xl font-bold text-emerald-800">${totalValue.toFixed(2)}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent mx-auto"></div>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay tokens registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div key={token.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        token.token_type === 'earned' ? 'bg-green-100' :
                        token.token_type === 'purchased' ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <Coins className={`w-6 h-6 ${
                          token.token_type === 'earned' ? 'text-green-700' :
                          token.token_type === 'purchased' ? 'text-blue-700' : 'text-slate-700'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-800 text-lg">{token.amount} Tokens</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            token.token_type === 'earned' ? 'bg-green-100 text-green-700' :
                            token.token_type === 'purchased' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {token.token_type === 'earned' ? 'Ganado' : token.token_type === 'purchased' ? 'Comprado' : 'Retirado'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Valor: <span className="font-semibold">${token.value}</span>
                        </p>
                        {token.blockchain_tx && (
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                            TX: {token.blockchain_tx.substring(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {new Date(token.transaction_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(token.transaction_date).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Blockchain Verificado</h3>
              <p className="text-yellow-100">
                Todas las transacciones están respaldadas por tecnología blockchain para garantizar transparencia y trazabilidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Registrar Token</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad de Tokens</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <select
                  value={formData.token_type}
                  onChange={(e) => setFormData({ ...formData, token_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                >
                  <option value="earned">Ganado</option>
                  <option value="purchased">Comprado</option>
                  <option value="retired">Retirado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Valor (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hash Blockchain (opcional)</label>
                <input
                  type="text"
                  value={formData.blockchain_tx}
                  onChange={(e) => setFormData({ ...formData, blockchain_tx: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  placeholder="0x..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold py-3 rounded-lg transition"
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
