// Error Boundary Component - Catches React errors and displays fallback UI
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { useTheme } from '../../hooks/useTheme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.background,
  },
  card: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
    lineHeight: 22,
  },
  errorText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: THEME.spacing.md,
  },
});

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const THEME = useTheme();
  const styles = createStyles(THEME);

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <MaterialIcons 
          name="error-outline" 
          size={64} 
          color={THEME.colors.primary} 
          style={styles.icon}
        />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. 
          Please try again or restart the app.
        </Text>
        {__DEV__ && error && (
          <Text style={styles.errorText}>
            {error.message || 'Unknown error'}
          </Text>
        )}
        <GlassButton
          title="Try Again"
          onPress={onReset}
          variant="primary"
          style={styles.button}
        />
      </GlassCard>
    </View>
  );
};

