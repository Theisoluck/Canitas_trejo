import { useState, useEffect } from 'react';
import { Sprout, MapPin, Coins, CloudCog, LogOut, User, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Hectare, Token, Emission } from '../lib/supabase';
import HectaresManager from './HectaresManager';
import TokensManager from './TokensManager';
import EmissionsManager from './EmissionsManager';

type View = 'dashboard' | 'hectares' | 'tokens' | 'emissions';

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [stats, setStats] = useState({
    totalHectares: 0,
    totalTokens: 0,
    totalEmissions: 0,
    activeHectares: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!profile) return;

    try {
      const [hectaresRes, tokensRes, emissionsRes] = await Promise.all([
        supabase.from('hectares').select('*').eq('user_id', profile.id),
        supabase.from('tokens').select('*').eq('user_id', profile.id),
        supabase.from('emissions').select('*').eq('user_id', profile.id),
      ]);

      const hectares = (hectaresRes.data || []) as Hectare[];
      const tokens = (tokensRes.data || []) as Token[];
      const emissions = (emissionsRes.data || []) as Emission[];

      const totalHectares = hectares.reduce((sum, h) => sum + Number(h.size), 0);
      const activeHectares = hectares.filter(h => h.status === 'active').length;
      const totalTokens = tokens.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.emission_amount), 0);

      setStats({
        totalHectares,
        totalTokens,
        totalEmissions,
        activeHectares,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (currentView === 'hectares') {
    return <HectaresManager onBack={() => { setCurrentView('dashboard'); loadStats(); }} />;
  }

  if (currentView === 'tokens') {
    return <TokensManager onBack={() => { setCurrentView('dashboard'); loadStats(); }} />;
  }

  if (currentView === 'emissions') {
    return <EmissionsManager onBack={() => { setCurrentView('dashboard'); loadStats(); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-green-600/20">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">EcoCarbon</h1>
                <p className="text-sm text-slate-500">Sistema de Gestión de Emisiones</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Bienvenido, {profile?.full_name?.split(' ')[0]}
          </h2>
          <p className="text-slate-600">
            Gestiona tus operaciones de caña de azúcar y monitorea tus emisiones de carbono
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-green-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Hectáreas Totales</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : stats.totalHectares.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.activeHectares} activas
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Coins className="w-6 h-6 text-yellow-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Tokens Generados</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : stats.totalTokens.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Créditos de carbono
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CloudCog className="w-6 h-6 text-blue-700" />
              </div>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Emisiones Totales</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : (stats.totalEmissions / 1000).toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Toneladas de CO₂
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-green-600/20">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <Sprout className="w-5 h-5 text-green-100" />
            </div>
            <p className="text-sm text-green-100 mb-1">Estado de la Cuenta</p>
            <p className="text-3xl font-bold">Activa</p>
            <p className="text-xs text-green-100 mt-2">
              Todas las operaciones funcionando
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => setCurrentView('hectares')} className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-green-500 hover:shadow-xl transition-all duration-300 text-left">
            <div className="bg-green-100 group-hover:bg-green-600 p-4 rounded-xl w-fit mb-4 transition">
              <MapPin className="w-8 h-8 text-green-700 group-hover:text-white transition" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gestionar Hectáreas</h3>
            <p className="text-slate-600 leading-relaxed">
              Administra tus campos de caña de azúcar, actualiza información de cultivos y monitorea el estado de tus hectáreas
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm font-medium text-green-700 group-hover:text-green-600">
                Administrar campos →
              </span>
            </div>
          </button>

          <button onClick={() => setCurrentView('tokens')} className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-yellow-500 hover:shadow-xl transition-all duration-300 text-left">
            <div className="bg-yellow-100 group-hover:bg-yellow-600 p-4 rounded-xl w-fit mb-4 transition">
              <Coins className="w-8 h-8 text-yellow-700 group-hover:text-white transition" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gestionar Tokens/Ganancias</h3>
            <p className="text-slate-600 leading-relaxed">
              Consulta tus créditos de carbono, analiza tus ganancias y gestiona transacciones registradas en blockchain
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm font-medium text-yellow-700 group-hover:text-yellow-600">
                Ver tokens →
              </span>
            </div>
          </button>

          <button onClick={() => setCurrentView('emissions')} className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left">
            <div className="bg-blue-100 group-hover:bg-blue-600 p-4 rounded-xl w-fit mb-4 transition">
              <CloudCog className="w-8 h-8 text-blue-700 group-hover:text-white transition" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gestionar Emisiones</h3>
            <p className="text-slate-600 leading-relaxed">
              Registra y consulta emisiones realizadas en cultivo, cosecha, transporte y procesamiento de caña
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm font-medium text-blue-700 group-hover:text-blue-600">
                Registrar emisiones →
              </span>
            </div>
          </button>
        </div>

        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Tecnología Blockchain</h3>
              <p className="text-green-100 leading-relaxed max-w-2xl">
                Todos tus tokens y transacciones están respaldados por tecnología blockchain, garantizando transparencia,
                trazabilidad y seguridad en cada operación de créditos de carbono.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <Sprout className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
