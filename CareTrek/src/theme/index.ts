import { DefaultTheme } from 'styled-components/native';

export const lightTheme: DefaultTheme = {
  colors: {
    // Primary colors
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primaryLight: '#818CF8',
    
    // Accent colors
    accent: '#10B981',
    accentDark: '#059669',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Background colors
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    
    // Text colors
    text: '#1F2937',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    
    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    
    // Other
    notification: '#EF4444',
    placeholder: '#9CA3AF',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

// Export the default theme
export default lightTheme;

// Type declarations for styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      primaryLight: string;
      accent: string;
      accentDark: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      background: string;
      surface: string;
      card: string;
      text: string;
      textSecondary: string;
      textDisabled: string;
      border: string;
      borderLight: string;
      notification: string;
      placeholder: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      round: number;
    };
    typography: {
      h1: {
        fontSize: number;
        fontWeight: string;
        lineHeight: number;
      };
      h2: {
        fontSize: number;
        fontWeight: string;
        lineHeight: number;
      };
      h3: {
        fontSize: number;
        fontWeight: string;
        lineHeight: number;
      };
      body1: {
        fontSize: number;
        lineHeight: number;
      };
      body2: {
        fontSize: number;
        lineHeight: number;
      };
      caption: {
        fontSize: number;
        lineHeight: number;
      };
      button: {
        fontSize: number;
        fontWeight: string;
        textTransform: string;
      };
    };
    shadows: {
      sm: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
      };
      md: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
      };
      lg: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
      };
    };
  }
}
