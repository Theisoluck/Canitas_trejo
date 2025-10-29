import { useState } from 'react';
import { Sprout, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        if (!fullName.trim()) {
          setError('Por favor ingresa tu nombre completo');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) setError(error.message);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-white">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <Sprout className="w-12 h-12 text-green-100" />
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight">EcoCarbon</h1>
                <p className="text-green-100 text-lg">Sistema de Gestión de Emisiones</p>
              </div>
            </div>

            <div className="space-y-6 text-lg leading-relaxed">
              <p className="text-green-50">
                Plataforma integral para el monitoreo y gestión de emisiones de carbono en la producción de caña de azúcar.
              </p>

              <div className="grid gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="font-semibold mb-2">Gestión de Hectáreas</h3>
                  <p className="text-sm text-green-100">Administra y monitorea tus campos de cultivo</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="font-semibold mb-2">Tokens y Ganancias</h3>
                  <p className="text-sm text-green-100">Rastrea tus créditos de carbono y beneficios económicos</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h3 className="font-semibold mb-2">Registro de Emisiones</h3>
                  <p className="text-sm text-green-100">Documenta y analiza emisiones en cada etapa productiva</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-slate-600">
                {isLogin ? 'Accede a tu cuenta' : 'Regístrate en el sistema'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Juan Pérez"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/30"
              >
                {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-green-700 hover:text-green-800 font-medium text-sm transition"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sistema seguro con tecnología blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
