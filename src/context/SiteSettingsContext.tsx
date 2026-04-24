import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { SiteSettings } from '../types/index';
import { api } from '../services/api';

const defaultSettings: SiteSettings = {
  shopName: '',
  shopTagline: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  socialInstagram: '',
  socialVk: '',
  socialTelegram: '',
  socialMessenger: '',
  bannerTitle: '',
  bannerSubtitle: '',
  bannerEnabled: true,
  deliveryInfo: '',
  paymentInfo: '',
  freeDeliveryFrom: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (data: SiteSettings) => Promise<void>;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.settings.get();
      setSettings({ ...defaultSettings, ...data });
    } catch {
      // keep defaults if backend unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (data: SiteSettings) => {
    const updated = await api.settings.update(data);
    setSettings({ ...defaultSettings, ...updated });
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, updateSettings, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
};
