import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyBlogs from './pages/MyBlogs';
import CreateBlog from './pages/CreateBlog';
import EditBlog from './pages/EditBlog';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 20px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)'
          },
          success: {
            style: { background: '#10B981', color: 'white' },
            iconTheme: { primary: 'white', secondary: '#10B981' },
          },
          error: {
            style: { background: '#EF4444', color: 'white' },
          },
        }}
      />
      <Routes>
        {/* Public Routes with Main Navbar/Footer */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="blog/:id" element={<BlogDetail />} />
        </Route>
        
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="blogs" element={<MyBlogs />} />
          <Route path="create" element={<CreateBlog />} />
          <Route path="edit/:id" element={<EditBlog />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
