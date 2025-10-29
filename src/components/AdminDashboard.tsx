import { useState, useEffect } from 'react';
import { Sprout, LogOut, Users, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import UserManager from './UserManager';
import OperatorDetails from './OperatorDetails';

type View = 'dashboard' | 'users' | 'operator-details';

interface AdminStats {
  totalOperators: number;
  activeOperators: number;
  totalHectares: number;
  totalEmissions: number;
  totalTokens: number;
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalOperators: 0,
    activeOperators: 0,
    totalHectares: 0,
    totalEmissions: 0,
    totalTokens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const [profilesRes, hectaresRes, emissionsRes, tokensRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'operator'),
        supabase.from('hectares').select('size'),
        supabase.from('emissions').select('emission_amount'),
        supabase.from('tokens').select('amount'),
      ]);

      const operators = profilesRes.data || [];
      const hectares = hectaresRes.data || [];
      const emissions = emissionsRes.data || [];
      const tokens = tokensRes.data || [];

      const totalHectares = hectares.reduce((sum, h) => sum + Number(h.size), 0);
      const totalEmissions = emissions.reduce((sum, e) => sum + Number(e.emission_amount), 0);
      const totalTokens = tokens.reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        totalOperators: operators.length,
        activeOperators: operators.filter(o => o.is_active).length,
        totalHectares,
        totalEmissions,
        totalTokens,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOperator = (operatorId: string) => {
    setSelectedOperatorId(operatorId);
    setCurrentView('operator-details');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (currentView === 'users') {
    return (
      <UserManager
        onBack={() => {
          setCurrentView('dashboard');
          loadAdminStats();
        }}
        onViewOperator={handleViewOperator}
      />
    );
  }

  if (currentView === 'operator-details' && selectedOperatorId) {
    return (
      <OperatorDetails
        operatorId={selectedOperatorId}
        onBack={() => {
          setCurrentView('users');
          setSelectedOperatorId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">EcoCarbon Admin</h1>
                <p className="text-sm text-slate-500">Panel de Administración</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {profile?.role}
                </p>
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
            Panel de Administración
          </h2>
          <p className="text-slate-600">
            Gestiona operadores y visualiza métricas generales del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Operadores</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : stats.totalOperators}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {stats.activeOperators} activos
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Hectáreas Totales</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : stats.totalHectares.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Todos los operadores
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Sprout className="w-6 h-6 text-yellow-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Tokens Totales</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : stats.totalTokens.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Créditos generados
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-red-700" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Emisiones Totales</p>
            <p className="text-3xl font-bold text-slate-800">
              {loading ? '...' : (stats.totalEmissions / 1000).toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Toneladas de CO₂
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setCurrentView('users')}
            className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left"
          >
            <div className="bg-blue-100 group-hover:bg-blue-600 p-4 rounded-xl w-fit mb-4 transition">
              <Users className="w-8 h-8 text-blue-700 group-hover:text-white transition" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gestionar Operadores</h3>
            <p className="text-slate-600 leading-relaxed">
              Crea, edita y administra cuentas de operadores. Visualiza sus datos y controla el acceso al sistema
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm font-medium text-blue-700 group-hover:text-blue-600">
                Administrar usuarios →
              </span>
            </div>
          </button>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Control Total</h3>
                <p className="text-blue-100 leading-relaxed">
                  Como administrador, tienes acceso completo a todos los datos del sistema.
                  Puedes visualizar y gestionar las operaciones de todos los operadores.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-blue-400/30">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200 mb-1">Operadores Activos</p>
                  <p className="text-2xl font-bold">{stats.activeOperators}</p>
                </div>
                <div>
                  <p className="text-blue-200 mb-1">Total Sistema</p>
                  <p className="text-2xl font-bold">{stats.totalOperators}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
