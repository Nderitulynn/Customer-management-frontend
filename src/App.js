// src/App.js
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes/AppRoutes';  // Move routes to separate file

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <Router>
            <AppRoutes />  {/* Clean route handling */}
          </Router>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;