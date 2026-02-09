import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import AccountLayout from './components/layout/AccountLayout';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import ShopDetail from './pages/ShopDetail';

import AccountProfile from './pages/account/AccountProfile';
import AccountOrders from './pages/account/AccountOrders';
import AccountNotifications from './pages/account/AccountNotifications';
import AccountRegisterSeller from './pages/account/AccountRegisterSeller';

import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminNotifications from './pages/admin/AdminNotifications';

import SellerOverview from './pages/seller/SellerOverview';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerSettings from './pages/seller/SellerSettings';
import SellerNotifications from './pages/seller/SellerNotifications';
import ProductForm from './pages/seller/ProductForm';

const ProtectedRoute = ({ children, requireAuth = false, requireAdmin = false, requireSeller = false }) => {
  const { user, isAdmin, isSeller, loading } = useAuth();

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireSeller && !isSeller && !user?.isSeller) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const Layout = ({ children }) => (
  <>
    <Header />
    <main style={{ minHeight: 'calc(100vh - 200px)' }}>{children}</main>
    <Footer />
  </>
);

const AccountLayoutWrapper = () => (
  <>
    <Header />
    <AccountLayout />
    <Footer />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public routes */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/products" element={<Layout><Products /></Layout>} />
              <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/shop/:sellerId" element={<Layout><ShopDetail /></Layout>} />
              <Route path="/search" element={<Layout><Products /></Layout>} />
              <Route path="/category/:id" element={<Layout><Products /></Layout>} />

              {/* Protected routes */}
              <Route path="/cart" element={
                <ProtectedRoute requireAuth>
                  <Layout><Cart /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute requireAuth>
                  <Layout><Checkout /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/payment/result" element={
                <ProtectedRoute requireAuth>
                  <Layout><PaymentResult /></Layout>
                </ProtectedRoute>
              } />

              {/* Account routes with sidebar */}
              <Route path="/account" element={
                <ProtectedRoute requireAuth>
                  <AccountLayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/account/profile" replace />} />
                <Route path="profile" element={<AccountProfile />} />
                <Route path="orders" element={<AccountOrders />} />
                <Route path="notifications" element={<AccountNotifications />} />
                <Route path="register-seller" element={<AccountRegisterSeller />} />
              </Route>

              {/* Admin routes with sidebar */}
              <Route path="/admin" element={
                <ProtectedRoute requireAuth requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="sellers" element={<AdminSellers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              {/* Seller routes with sidebar */}
              <Route path="/seller" element={
                <ProtectedRoute requireAuth requireSeller>
                  <SellerLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/seller/dashboard" replace />} />
                <Route path="dashboard" element={<SellerOverview />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route path="notifications" element={<SellerNotifications />} />
                <Route path="settings" element={<SellerSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
