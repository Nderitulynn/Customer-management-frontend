import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, User, Shield, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'assistant' // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Use AuthContext instead of direct storage manipulation
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setErrors({});
    
    try {
      console.log('Login attempt with:', formData);
      
      // Use AuthContext login function instead of direct API call
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard');
        
        // Get the user's actual role from the authentication response
        const userRole = result.user?.role || result.role || formData.role;
        
        // Direct role-based navigation - NO GENERIC DASHBOARD FALLBACK
        if (userRole === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (userRole === 'assistant') {
          navigate('/assistant-dashboard', { replace: true });
        } else if (userRole === 'customer') {
          navigate('/customer-dashboard', { replace: true });
        } else {
          // Handle unknown roles with error instead of generic dashboard
          setErrors({ 
            submit: 'Invalid user role. Please contact administrator.' 
          });
          console.error('Unknown user role:', userRole);
        }
        
      } else {
        // Handle login failure
        setErrors({ 
          submit: result.message || 'Login failed. Please check your credentials.' 
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: error.message || 'Login failed. Please try again.' 
      });
    }
  };

  const roleOptions = [
    { value: 'customer', label: 'Customer', icon: ShoppingCart, description: 'Access your orders and profile' },
    { value: 'assistant', label: 'Assistant', icon: User, description: 'Access assistant dashboard' },
    { value: 'admin', label: 'Administrator', icon: Shield, description: 'Full system access' }
  ];

  // Display auth error from context if it exists
  const displayError = errors.submit || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Please sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Select Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                  disabled={authLoading}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.role && <p className="text-red-400 text-sm">{errors.role}</p>}
              
              {/* Role Description */}
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                {roleOptions.find(opt => opt.value === formData.role)?.icon && (
                  React.createElement(roleOptions.find(opt => opt.value === formData.role).icon, {
                    className: "w-4 h-4"
                  })
                )}
                <span>{roleOptions.find(opt => opt.value === formData.role)?.description}</span>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
                disabled={authLoading}
              />
              {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 pr-12"
                  placeholder="Enter your password"
                  disabled={authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white transition-colors duration-200"
                  disabled={authLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            {/* Submit Error */}
            {displayError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{displayError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {authLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Sign in as {roleOptions.find(opt => opt.value === formData.role)?.label}</span>
                  {roleOptions.find(opt => opt.value === formData.role)?.icon && (
                    React.createElement(roleOptions.find(opt => opt.value === formData.role).icon, {
                      className: "w-5 h-5"
                    })
                  )}
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account? 
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 ml-1 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;