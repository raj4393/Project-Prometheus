import React from 'react';
/**
 * @module StoreContext
 * @description Strongly typed React Context and action dispatcher providing
 * global state management for the Project Prometheus application.
 * Wraps the projectReducer in a context provider with memoized dispatch.
 */

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';
import {
  projectReducer,
  EngineStatus,
  type AppState,
  type AppAction,
} from './projectReducer';
import { ALL_PRESET_BLUEPRINTS } from '../../domain/models/projectPresets';

/**
 * Shape of the store context value containing both state and dispatcher.
 *
 * @property state - The current application state
 * @property dispatch - The action dispatcher function
 */
interface StoreContextValue {
  readonly state: AppState;
  readonly dispatch: Dispatch<AppAction>;
}

/**
 * The initial application state loaded on first render.
 * Pre-populates with 3 capstone blueprint presets for zero empty-state.
 */
const INITIAL_STATE: AppState = {
  profile: null,
  blueprint: null,
  roadmap: null,
  defense: null,
  engineStatus: EngineStatus.Idle,
  activeTab: 'intake',
  isGenerating: false,
  isAudioEnabled: false,
  presetBlueprints: ALL_PRESET_BLUEPRINTS,
};

/**
 * React Context for global application state.
 * Consumers access this via the useStore() custom hook.
 */
const StoreContext = createContext<StoreContextValue | null>(null);

/**
 * Props for the StoreProvider component.
 *
 * @property children - The child components that will have access to the store
 * @property initialState - Optional override for the initial state (useful for testing)
 */
interface StoreProviderProps {
  readonly children: ReactNode;
  readonly initialState?: AppState;
}

/**
 * Provides the global application state and dispatch function to all
 * descendant components via React Context.
 *
 * @param props - Provider props including children and optional initial state
 * @returns The context provider wrapping the children
 *
 * @example
 * ```tsx
 * <StoreProvider>
 *   <App />
 * </StoreProvider>
 * ```
 */
export function StoreProvider({ children, initialState }: StoreProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(projectReducer, initialState ?? INITIAL_STATE);

  const contextValue = useMemo<StoreContextValue>(
    () => ({ state, dispatch }),
    [state, dispatch]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Custom hook to access the global store context.
 * Must be used within a StoreProvider.
 *
 * @returns The current store context value with state and dispatch
 * @throws Error if used outside of a StoreProvider
 *
 * @example
 * ```tsx
 * const { state, dispatch } = useStore();
 * ```
 */
export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (context === null) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export { INITIAL_STATE };
