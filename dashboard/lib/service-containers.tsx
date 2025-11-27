'use client';

/**
 * 🖖 Service Container System
 * 
 * Provides ordered service initialization with role-based status tracking
 * Each service is a "mock container" that describes its role and loading status
 * 
 * Architecture:
 * - Services load in dependency order
 * - Each service reports its own status
 * - Components can subscribe to service status
 * - Services can have dependencies on other services
 * 
 * Crew: Data (Architecture) & La Forge (Implementation) & Troi (UX)
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type ServiceStatus = 'pending' | 'initializing' | 'loading' | 'ready' | 'error' | 'offline';

export interface ServiceContainer {
  id: string;
  name: string;
  role: string;
  description: string;
  status: ServiceStatus;
  dependencies: string[]; // IDs of services this depends on
  progress: {
    current: number;
    total: number;
    message: string;
  };
  error?: string;
  lastUpdate?: number;
  metadata?: Record<string, any>;
}

export interface ServiceContainerContextType {
  services: Map<string, ServiceContainer>;
  registerService: (service: Omit<ServiceContainer, 'status' | 'progress' | 'lastUpdate'>) => void;
  updateServiceStatus: (id: string, status: ServiceStatus, progress?: Partial<ServiceContainer['progress']>, error?: string) => void;
  getService: (id: string) => ServiceContainer | undefined;
  getServicesByStatus: (status: ServiceStatus) => ServiceContainer[];
  getReadyServices: () => ServiceContainer[];
  getPendingServices: () => ServiceContainer[];
  getServicesInOrder: () => ServiceContainer[];
  isServiceReady: (id: string) => boolean;
  areDependenciesReady: (serviceId: string) => boolean;
}

const ServiceContainerContext = createContext<ServiceContainerContextType | null>(null);

/**
 * Service Container Provider
 * Manages all service containers and their loading order
 */
export function ServiceContainerProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Map<string, ServiceContainer>>(new Map());

  /**
   * Register a new service container
   */
  const registerService = useCallback((service: Omit<ServiceContainer, 'status' | 'progress' | 'lastUpdate'>) => {
    setServices(prev => {
      const newMap = new Map(prev);
      newMap.set(service.id, {
        ...service,
        status: 'pending',
        progress: {
          current: 0,
          total: 1,
          message: 'Waiting to initialize...'
        },
        lastUpdate: Date.now()
      });
      return newMap;
    });
  }, []);

  /**
   * Update service status and progress
   */
  const updateServiceStatus = useCallback((
    id: string,
    status: ServiceStatus,
    progress?: Partial<ServiceContainer['progress']>,
    error?: string
  ) => {
    setServices(prev => {
      const newMap = new Map(prev);
      const service = newMap.get(id);
      if (service) {
        newMap.set(id, {
          ...service,
          status,
          progress: progress ? { ...service.progress, ...progress } : service.progress,
          error,
          lastUpdate: Date.now()
        });
      }
      return newMap;
    });
  }, []);

  /**
   * Get a service by ID
   */
  const getService = useCallback((id: string) => {
    return services.get(id);
  }, [services]);

  /**
   * Get services by status
   */
  const getServicesByStatus = useCallback((status: ServiceStatus) => {
    return Array.from(services.values()).filter(s => s.status === status);
  }, [services]);

  /**
   * Get all ready services
   */
  const getReadyServices = useCallback(() => {
    return getServicesByStatus('ready');
  }, [getServicesByStatus]);

  /**
   * Get all pending services
   */
  const getPendingServices = useCallback(() => {
    return getServicesByStatus('pending');
  }, [getServicesByStatus]);

  /**
   * Get services in dependency order (topological sort)
   */
  const getServicesInOrder = useCallback(() => {
    const sorted: ServiceContainer[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (serviceId: string) => {
      if (visiting.has(serviceId)) {
        // Circular dependency detected
        console.warn(`⚠️  Circular dependency detected for service: ${serviceId}`);
        return;
      }
      if (visited.has(serviceId)) {
        return;
      }

      visiting.add(serviceId);
      const service = services.get(serviceId);
      if (service) {
        // Visit dependencies first
        service.dependencies.forEach(depId => {
          if (services.has(depId)) {
            visit(depId);
          }
        });
        visiting.delete(serviceId);
        visited.add(serviceId);
        sorted.push(service);
      }
    };

    // Visit all services
    services.forEach((_, id) => {
      if (!visited.has(id)) {
        visit(id);
      }
    });

    return sorted;
  }, [services]);

  /**
   * Check if a service is ready
   */
  const isServiceReady = useCallback((id: string) => {
    const service = services.get(id);
    return service?.status === 'ready';
  }, [services]);

  /**
   * Check if all dependencies of a service are ready
   */
  const areDependenciesReady = useCallback((serviceId: string) => {
    const service = services.get(serviceId);
    if (!service) return false;
    
    return service.dependencies.every(depId => {
      const dep = services.get(depId);
      return dep?.status === 'ready';
    });
  }, [services]);

  const value: ServiceContainerContextType = {
    services,
    registerService,
    updateServiceStatus,
    getService,
    getServicesByStatus,
    getReadyServices,
    getPendingServices,
    getServicesInOrder,
    isServiceReady,
    areDependenciesReady
  };

  return (
    <ServiceContainerContext.Provider value={value}>
      {children}
    </ServiceContainerContext.Provider>
  );
}

/**
 * Hook to access service container context
 */
export function useServiceContainers() {
  const context = useContext(ServiceContainerContext);
  if (!context) {
    throw new Error('useServiceContainers must be used within ServiceContainerProvider');
  }
  return context;
}

/**
 * Hook to initialize a service with automatic dependency checking
 */
export function useServiceInitialization(
  serviceId: string,
  serviceConfig: Omit<ServiceContainer, 'status' | 'progress' | 'lastUpdate'>,
  initializeFn: () => Promise<void>
) {
  const { registerService, updateServiceStatus, areDependenciesReady, isServiceReady } = useServiceContainers();
  const [initialized, setInitialized] = useState(false);

  // Register service on mount
  useEffect(() => {
    registerService(serviceConfig);
  }, [registerService, serviceId]);

  // Initialize service when dependencies are ready
  useEffect(() => {
    if (initialized || isServiceReady(serviceId)) return;

    // Check if dependencies are ready
    if (!areDependenciesReady(serviceId)) {
      updateServiceStatus(serviceId, 'pending', {
        current: 0,
        total: 1,
        message: 'Waiting for dependencies...'
      });
      return;
    }

    // Start initialization
    updateServiceStatus(serviceId, 'initializing', {
      current: 0,
      total: 1,
      message: `Initializing ${serviceConfig.name}...`
    });

    initializeFn()
      .then(() => {
        updateServiceStatus(serviceId, 'ready', {
          current: 1,
          total: 1,
          message: `${serviceConfig.name} ready`
        });
        setInitialized(true);
      })
      .catch((error) => {
        console.error(`Failed to initialize ${serviceConfig.name}:`, error);
        updateServiceStatus(serviceId, 'error', {
          current: 0,
          total: 1,
          message: `Failed to initialize ${serviceConfig.name}`
        }, error.message);
      });
  }, [serviceId, initialized, areDependenciesReady, isServiceReady, updateServiceStatus, initializeFn, serviceConfig.name]);

  return {
    isReady: isServiceReady(serviceId),
    service: useServiceContainers().getService(serviceId)
  };
}



