import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Catalog } from './pages/Catalog';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { MyOrders } from './pages/MyOrders';
import { Promocoes } from './pages/Promocoes';
import { Perfil } from './pages/Perfil';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MeusDados } from './pages/perfil/MeusDados';
import { Enderecos } from './pages/perfil/Enderecos';
import { Contato } from './pages/perfil/Contato';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/promocoes" element={<Promocoes />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/dados" element={<MeusDados />} />
        <Route path="/perfil/enderecos" element={<Enderecos />} />
        <Route path="/perfil/contato" element={<Contato />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

