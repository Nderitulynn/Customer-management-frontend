// src/App.js
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes'; 

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