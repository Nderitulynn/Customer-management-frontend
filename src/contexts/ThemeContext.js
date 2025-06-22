import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // Theme mode
  mode: 'light', // 'light', 'dark', 'system'
  isDark: false,
  
  // Color scheme
  primaryColor: 'blue',
  accentColor: 'purple',
  
  // Layout preferences
  sidebarCollapsed: false,
  sidebarPosition: 'left', // 'left', 'right'
  headerFixed: true,
  compactMode: false,
  
  // Typography
  fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
  fontFamily: 'inter', // 'inter', 'roboto', 'poppins', 'system'
  
  // Accessibility
  reducedMotion: false,
  highContrast: false,
  
  // Component preferences
  roundedCorners: 'medium', // 'none', 'small', 'medium', 'large', 'full'
  cardShadow: 'medium', // 'none', 'small', 'medium', 'large'
  
  // Dashboard layout
  dashboardLayout: 'grid', // 'grid', 'list', 'compact'
  cardsPerRow: 3, // 2, 3, 4, 6
  
  // Animation preferences
  animationsEnabled: true,
  transitionSpeed: 'medium', // 'slow', 'medium', 'fast'
  
  // Custom CSS variables
  customColors: {},
  
  // Loading state
  isLoading: false,
  
  // System theme detection
  systemTheme: 'light'
};

// Action types
const THEME_ACTIONS = {
  SET_MODE: 'SET_MODE',
  SET_DARK_MODE: 'SET_DARK_MODE',
  SET_PRIMARY_COLOR: 'SET_PRIMARY_COLOR',
  SET_ACCENT_COLOR: 'SET_ACCENT_COLOR',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  SET_SIDEBAR_POSITION: 'SET_SIDEBAR_POSITION',
  SET_HEADER_FIXED: 'SET_HEADER_FIXED',
  SET_COMPACT_MODE: 'SET_COMPACT_MODE',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  SET_FONT_FAMILY: 'SET_FONT_FAMILY',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  SET_HIGH_CONTRAST: 'SET_HIGH_CONTRAST',
  SET_ROUNDED_CORNERS: 'SET_ROUNDED_CORNERS',
  SET_CARD_SHADOW: 'SET_CARD_SHADOW',
  SET_DASHBOARD_LAYOUT: 'SET_DASHBOARD_LAYOUT',
  SET_CARDS_PER_ROW: 'SET_CARDS_PER_ROW',
  SET_ANIMATIONS_ENABLED: 'SET_ANIMATIONS_ENABLED',
  SET_TRANSITION_SPEED: 'SET_TRANSITION_SPEED',
  SET_CUSTOM_COLORS: 'SET_CUSTOM_COLORS',
  UPDATE_CUSTOM_COLOR: 'UPDATE_CUSTOM_COLOR',
  RESET_THEME: 'RESET_THEME',
  LOAD_THEME: 'LOAD_THEME',
  SET_LOADING: 'SET_LOADING',
  SET_SYSTEM_THEME: 'SET_SYSTEM_THEME'
};

// Available theme options
export const THEME_OPTIONS = {
  MODES: ['light', 'dark', 'system'],
  PRIMARY_COLORS: [
    'blue', 'indigo', 'purple', 'pink', 'red', 'orange', 
    'yellow', 'green', 'teal', 'cyan', 'gray'
  ],
  ACCENT_COLORS: [
    'blue', 'indigo', 'purple', 'pink', 'red', 'orange', 
    'yellow', 'green', 'teal', 'cyan', 'rose', 'emerald'
  ],
  FONT_SIZES: ['small', 'medium', 'large', 'extra-large'],
  FONT_FAMILIES: [
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'poppins', label: 'Poppins' },
    { value: 'system', label: 'System Default' }
  ],
  ROUNDED_CORNERS: ['none', 'small', 'medium', 'large', 'full'],
  CARD_SHADOWS: ['none', 'small', 'medium', 'large'],
  DASHBOARD_LAYOUTS: ['grid', 'list', 'compact'],
  CARDS_PER_ROW: [2, 3, 4, 6],
  TRANSITION_SPEEDS: ['slow', 'medium', 'fast']
};

// CSS variable mappings
const CSS_VARIABLES = {
  primaryColor: '--primary-color',
  accentColor: '--accent-color',
  fontSize: '--font-size-base',
  fontFamily: '--font-family',
  roundedCorners: '--border-radius',
  cardShadow: '--card-shadow',
  transitionSpeed: '--transition-speed'
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_MODE:
      const newMode = action.payload;
      const systemTheme = state.systemTheme;
      const isDark = newMode === 'dark' || (newMode === 'system' && systemTheme === 'dark');
      
      return {
        ...state,
        mode: newMode,
        isDark
      };

    case THEME_ACTIONS.SET_DARK_MODE:
      return {
        ...state,
        isDark: action.payload
      };

    case THEME_ACTIONS.SET_PRIMARY_COLOR:
      return {
        ...state,
        primaryColor: action.payload
      };

    case THEME_ACTIONS.SET_ACCENT_COLOR:
      return {
        ...state,
        accentColor: action.payload
      };

    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };

    case THEME_ACTIONS.SET_SIDEBAR_COLLAPSED:
      return {
        ...state,
        sidebarCollapsed: action.payload
      };

    case THEME_ACTIONS.SET_SIDEBAR_POSITION:
      return {
        ...state,
        sidebarPosition: action.payload
      };

    case THEME_ACTIONS.SET_HEADER_FIXED:
      return {
        ...state,
        headerFixed: action.payload
      };

    case THEME_ACTIONS.SET_COMPACT_MODE:
      return {
        ...state,
        compactMode: action.payload
      };

    case THEME_ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload
      };

    case THEME_ACTIONS.SET_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload
      };

    case THEME_ACTIONS.SET_REDUCED_MOTION:
      return {
        ...state,
        reducedMotion: action.payload
      };

    case THEME_ACTIONS.SET_HIGH_CONTRAST:
      return {
        ...state,
        highContrast: action.payload
      };

    case THEME_ACTIONS.SET_ROUNDED_CORNERS:
      return {
        ...state,
        roundedCorners: action.payload
      };

    case THEME_ACTIONS.SET_CARD_SHADOW:
      return {
        ...state,
        cardShadow: action.payload
      };

    case THEME_ACTIONS.SET_DASHBOARD_LAYOUT:
      return {
        ...state,
        dashboardLayout: action.payload
      };

    case THEME_ACTIONS.SET_CARDS_PER_ROW:
      return {
        ...state,
        cardsPerRow: action.payload
      };

    case THEME_ACTIONS.SET_ANIMATIONS_ENABLED:
      return {
        ...state,
        animationsEnabled: action.payload
      };

    case THEME_ACTIONS.SET_TRANSITION_SPEED:
      return {
        ...state,
        transitionSpeed: action.payload
      };

    case THEME_ACTIONS.SET_CUSTOM_COLORS:
      return {
        ...state,
        customColors: action.payload
      };

    case THEME_ACTIONS.UPDATE_CUSTOM_COLOR:
      return {
        ...state,
        customColors: {
          ...state.customColors,
          [action.payload.key]: action.payload.value
        }
      };

    case THEME_ACTIONS.RESET_THEME:
      return {
        ...initialState,
        systemTheme: state.systemTheme
      };

    case THEME_ACTIONS.LOAD_THEME:
      return {
        ...state,
        ...action.payload,
        isLoading: false
      };

    case THEME_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case THEME_ACTIONS.SET_SYSTEM_THEME:
      const systemThemeValue = action.payload;
      const currentMode = state.mode;
      const shouldBeDark = currentMode === 'dark' || (currentMode === 'system' && systemThemeValue === 'dark');
      
      return {
        ...state,
        systemTheme: systemThemeValue,
        isDark: shouldBeDark
      };

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
    setupSystemThemeListener();
    
    return () => {
      cleanupSystemThemeListener();
    };
  }, []);

  // Apply theme changes to CSS variables
  useEffect(() => {
    applyThemeToCSS();
  }, [state]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    saveThemeToStorage();
  }, [state]);

  // Initialize theme from localStorage and system preferences
  const initializeTheme = () => {
    dispatch({ type: THEME_ACTIONS.SET_LOADING, payload: true });

    try {
      // Detect system theme
      const systemTheme = getSystemTheme();
      dispatch({ type: THEME_ACTIONS.SET_SYSTEM_THEME, payload: systemTheme });

      // Load saved theme from localStorage
      const savedTheme = loadThemeFromStorage();
      
      if (savedTheme) {
        // Apply saved theme
        dispatch({ type: THEME_ACTIONS.LOAD_THEME, payload: savedTheme });
      } else {
        // Use system theme as default
        dispatch({ 
          type: THEME_ACTIONS.SET_MODE, 
          payload: 'system'
        });
        dispatch({ type: THEME_ACTIONS.SET_LOADING, payload: false });
      }

      // Apply accessibility preferences
      applyAccessibilityPreferences();
      
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      dispatch({ type: THEME_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Get system theme preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Setup system theme change listener
  const setupSystemThemeListener = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        dispatch({ type: THEME_ACTIONS.SET_SYSTEM_THEME, payload: newSystemTheme });
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      // Store reference for cleanup
      window.themeMediaQuery = mediaQuery;
      window.themeChangeHandler = handleSystemThemeChange;
    }
  };

  // Cleanup system theme listener
  const cleanupSystemThemeListener = () => {
    if (typeof window !== 'undefined' && window.themeMediaQuery && window.themeChangeHandler) {
      window.themeMediaQuery.removeEventListener('change', window.themeChangeHandler);
    }
  };

  // Apply accessibility preferences
  const applyAccessibilityPreferences = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: true });
        dispatch({ type: THEME_ACTIONS.SET_ANIMATIONS_ENABLED, payload: false });
      }

      // Check for high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      if (prefersHighContrast) {
        dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: true });
      }
    }
  };

  // Load theme from localStorage
  const loadThemeFromStorage = () => {
    try {
      const savedTheme = localStorage.getItem('macrame_theme');
      return savedTheme ? JSON.parse(savedTheme) : null;
    } catch (error) {
      console.error('Failed to load theme from storage:', error);
      return null;
    }
  };

  // Save theme to localStorage
  const saveThemeToStorage = () => {
    try {
      const themeToSave = {
        mode: state.mode,
        primaryColor: state.primaryColor,
        accentColor: state.accentColor,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarPosition: state.sidebarPosition,
        headerFixed: state.headerFixed,
        compactMode: state.compactMode,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        roundedCorners: state.roundedCorners,
        cardShadow: state.cardShadow,
        dashboardLayout: state.dashboardLayout,
        cardsPerRow: state.cardsPerRow,
        animationsEnabled: state.animationsEnabled,
        transitionSpeed: state.transitionSpeed,
        customColors: state.customColors
      };

      localStorage.setItem('macrame_theme', JSON.stringify(themeToSave));
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  // Apply theme to CSS variables
  const applyThemeToCSS = () => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply theme mode classes
    root.classList.toggle('dark', state.isDark);
    root.classList.toggle('light', !state.isDark);
    root.classList.toggle('high-contrast', state.highContrast);
    root.classList.toggle('reduced-motion', state.reducedMotion);
    root.classList.toggle('compact-mode', state.compactMode);

    // Apply color scheme
    root.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
    root.setAttribute('data-primary-color', state.primaryColor);
    root.setAttribute('data-accent-color', state.accentColor);

    // Apply layout classes
    root.setAttribute('data-sidebar-position', state.sidebarPosition);
    root.setAttribute('data-dashboard-layout', state.dashboardLayout);
    root.setAttribute('data-cards-per-row', state.cardsPerRow.toString());

    // Apply typography
    root.setAttribute('data-font-size', state.fontSize);
    root.setAttribute('data-font-family', state.fontFamily);

    // Apply component styling
    root.setAttribute('data-rounded-corners', state.roundedCorners);
    root.setAttribute('data-card-shadow', state.cardShadow);
    root.setAttribute('data-transition-speed', state.transitionSpeed);

    // Apply custom colors as CSS variables
    Object.entries(state.customColors).forEach(([key, value]) => {
      root.style.setProperty(`--custom-${key}`, value);
    });

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor();
  };

  // Update meta theme-color
  const updateMetaThemeColor = () => {
    if (typeof document === 'undefined') return;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    // Set theme color based on current theme
    const themeColor = state.isDark ? '#1f2937' : '#ffffff';
    metaThemeColor.content = themeColor;
  };

  // Theme action functions
  const setMode = (mode) => {
    dispatch({ type: THEME_ACTIONS.SET_MODE, payload: mode });
  };

  const setPrimaryColor = (color) => {
    dispatch({ type: THEME_ACTIONS.SET_PRIMARY_COLOR, payload: color });
  };

  const setAccentColor = (color) => {
    dispatch({ type: THEME_ACTIONS.SET_ACCENT_COLOR, payload: color });
  };

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setSidebarCollapsed = (collapsed) => {
    dispatch({ type: THEME_ACTIONS.SET_SIDEBAR_COLLAPSED, payload: collapsed });
  };

  const setSidebarPosition = (position) => {
    dispatch({ type: THEME_ACTIONS.SET_SIDEBAR_POSITION, payload: position });
  };

  const setHeaderFixed = (fixed) => {
    dispatch({ type: THEME_ACTIONS.SET_HEADER_FIXED, payload: fixed });
  };

  const setCompactMode = (compact) => {
    dispatch({ type: THEME_ACTIONS.SET_COMPACT_MODE, payload: compact });
  };

  const setFontSize = (size) => {
    dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: size });
  };

  const setFontFamily = (family) => {
    dispatch({ type: THEME_ACTIONS.SET_FONT_FAMILY, payload: family });
  };

  const setReducedMotion = (reduced) => {
    dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: reduced });
  };

  const setHighContrast = (highContrast) => {
    dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: highContrast });
  };

  const setRoundedCorners = (corners) => {
    dispatch({ type: THEME_ACTIONS.SET_ROUNDED_CORNERS, payload: corners });
  };

  const setCardShadow = (shadow) => {
    dispatch({ type: THEME_ACTIONS.SET_CARD_SHADOW, payload: shadow });
  };

  const setDashboardLayout = (layout) => {
    dispatch({ type: THEME_ACTIONS.SET_DASHBOARD_LAYOUT, payload: layout });
  };

  const setCardsPerRow = (count) => {
    dispatch({ type: THEME_ACTIONS.SET_CARDS_PER_ROW, payload: count });
  };

  const setAnimationsEnabled = (enabled) => {
    dispatch({ type: THEME_ACTIONS.SET_ANIMATIONS_ENABLED, payload: enabled });
  };

  const setTransitionSpeed = (speed) => {
    dispatch({ type: THEME_ACTIONS.SET_TRANSITION_SPEED, payload: speed });
  };

  const setCustomColors = (colors) => {
    dispatch({ type: THEME_ACTIONS.SET_CUSTOM_COLORS, payload: colors });
  };

  const updateCustomColor = (key, value) => {
    dispatch({ 
      type: THEME_ACTIONS.UPDATE_CUSTOM_COLOR, 
      payload: { key, value } 
    });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
    localStorage.removeItem('macrame_theme');
  };

  // Utility functions
  const toggleTheme = () => {
    const newMode = state.isDark ? 'light' : 'dark';
    setMode(newMode);
  };

  const getThemeClasses = () => {
    return {
      isDark: state.isDark,
      isLight: !state.isDark,
      sidebarCollapsed: state.sidebarCollapsed,
      compactMode: state.compactMode,
      reducedMotion: state.reducedMotion,
      highContrast: state.highContrast,
      animationsEnabled: state.animationsEnabled
    };
  };

  const getLayoutClasses = () => {
    return {
      [`sidebar-${state.sidebarPosition}`]: true,
      [`dashboard-${state.dashboardLayout}`]: true,
      [`cards-${state.cardsPerRow}`]: true,
      'header-fixed': state.headerFixed
    };
  };

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    setMode,
    setPrimaryColor,
    setAccentColor,
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarPosition,
    setHeaderFixed,
    setCompactMode,
    setFontSize,
    setFontFamily,
    setReducedMotion,
    setHighContrast,
    setRoundedCorners,
    setCardShadow,
    setDashboardLayout,
    setCardsPerRow,
    setAnimationsEnabled,
    setTransitionSpeed,
    setCustomColors,
    updateCustomColor,
    resetTheme,
    toggleTheme,

    // Utilities
    getThemeClasses,
    getLayoutClasses,

    // Constants
    THEME_OPTIONS
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// Export context for direct access if needed
export default ThemeContext;