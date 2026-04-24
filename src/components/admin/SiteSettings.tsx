import React, { useState, useEffect } from 'react';
import type { SiteSettings } from '../../types/index';
import { useSiteSettings } from '../../context/SiteSettingsContext';

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

const SiteSettingsManager: React.FC = () => {
  const { settings: contextSettings, updateSettings, loading } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('shop');

  useEffect(() => {
    setSettings({ ...defaultSettings, ...contextSettings });
  }, [contextSettings]);

  const handleChange = (field: keyof SiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Не удалось сохранить настройки. Проверьте подключение к серверу.');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'shop', label: 'Магазин', icon: '🏪' },
    { id: 'contacts', label: 'Контакты', icon: '📞' },
    { id: 'social', label: 'Соцсети', icon: '🔗' },
    { id: 'banner', label: 'Баннер', icon: '🖼️' },
    { id: 'delivery', label: 'Доставка и оплата', icon: '🚚' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <nav className="flex flex-col gap-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {/* Магазин */}
          {activeSection === 'shop' && (
            <Section title="Название магазина / бренда">
              <Field
                label="Название магазина"
                placeholder="Например: LUXE Store"
                value={settings.shopName}
                onChange={v => handleChange('shopName', v)}
              />
              <Field
                label="Слоган / подзаголовок"
                placeholder="Например: Стиль, который говорит за вас"
                value={settings.shopTagline}
                onChange={v => handleChange('shopTagline', v)}
              />
            </Section>
          )}

          {/* Контакты */}
          {activeSection === 'contacts' && (
            <Section title="Контактная информация">
              <Field
                label="Телефон"
                placeholder="+7 (999) 123-45-67"
                value={settings.contactPhone}
                onChange={v => handleChange('contactPhone', v)}
              />
              <Field
                label="Email"
                placeholder="info@example.com"
                value={settings.contactEmail}
                onChange={v => handleChange('contactEmail', v)}
                type="email"
              />
              <Field
                label="Адрес"
                placeholder="г. Москва, ул. Примерная, д. 1"
                value={settings.contactAddress}
                onChange={v => handleChange('contactAddress', v)}
              />
            </Section>
          )}

          {/* Соцсети */}
          {activeSection === 'social' && (
            <Section title="Ссылки на социальные сети">
              <Field
                label="Instagram"
                placeholder="https://instagram.com/yourshop"
                value={settings.socialInstagram}
                onChange={v => handleChange('socialInstagram', v)}
                icon={
                  <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                }
              />
              <Field
                label="ВКонтакте"
                placeholder="https://vk.com/yourshop"
                value={settings.socialVk}
                onChange={v => handleChange('socialVk', v)}
                icon={
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.101-.458.593v1.566c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.339-3.202C4.716 10.95 4.012 8.8 4.012 8.427c0-.254.101-.491.593-.491h1.744c.44 0 .61.203.779.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.101.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.814-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .643.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.745-.576.745z" />
                  </svg>
                }
              />
              <Field
                label="Telegram"
                placeholder="https://t.me/yourshop"
                value={settings.socialTelegram}
                onChange={v => handleChange('socialTelegram', v)}
                icon={
                  <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                }
              />
              <Field
                label="MAX"
                placeholder="https://max.ru/yourshop"
                value={settings.socialMessenger}
                onChange={v => handleChange('socialMessenger', v)}
                icon={
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5v-9l7 4.5-7 4.5z"/>
                  </svg>
                }
              />
            </Section>
          )}

          {/* Баннер */}
          {activeSection === 'banner' && (
            <Section title="Баннер на главной странице">
              <div className="flex items-center gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => handleChange('bannerEnabled', !settings.bannerEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    settings.bannerEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      settings.bannerEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Баннер {settings.bannerEnabled ? 'включён' : 'выключен'}
                </span>
              </div>
              <Field
                label="Заголовок баннера"
                placeholder="Например: Новая коллекция уже здесь"
                value={settings.bannerTitle}
                onChange={v => handleChange('bannerTitle', v)}
                disabled={!settings.bannerEnabled}
              />
              <Field
                label="Подзаголовок / описание"
                placeholder="Например: Откройте для себя стиль нового сезона"
                value={settings.bannerSubtitle}
                onChange={v => handleChange('bannerSubtitle', v)}
                disabled={!settings.bannerEnabled}
                textarea
              />
            </Section>
          )}

          {/* Доставка */}
          {activeSection === 'delivery' && (
            <Section title="Условия доставки и оплаты">
              <Field
                label="Информация о доставке"
                placeholder="Например: Доставка по всей России от 1 до 7 дней..."
                value={settings.deliveryInfo}
                onChange={v => handleChange('deliveryInfo', v)}
                textarea
              />
              <Field
                label="Информация об оплате"
                placeholder="Например: Оплата картой онлайн, наличными при получении..."
                value={settings.paymentInfo}
                onChange={v => handleChange('paymentInfo', v)}
                textarea
              />
              <Field
                label="Бесплатная доставка от суммы (₽)"
                placeholder="Например: 3000"
                value={settings.freeDeliveryFrom}
                onChange={v => handleChange('freeDeliveryFrom', v)}
                type="number"
              />
            </Section>
          )}

          {/* SEO */}
          {activeSection === 'seo' && (
            <Section title="SEO — поисковая оптимизация">
              <Field
                label="Мета-заголовок страницы (title)"
                placeholder="Например: LUXE Store — модная одежда онлайн"
                value={settings.seoTitle}
                onChange={v => handleChange('seoTitle', v)}
                hint="Рекомендуемая длина: 50–60 символов"
              />
              <Field
                label="Мета-описание (description)"
                placeholder="Краткое описание сайта для поисковиков..."
                value={settings.seoDescription}
                onChange={v => handleChange('seoDescription', v)}
                textarea
                hint="Рекомендуемая длина: 120–160 символов"
              />
              <Field
                label="Ключевые слова (keywords)"
                placeholder="одежда, мода, интернет-магазин"
                value={settings.seoKeywords}
                onChange={v => handleChange('seoKeywords', v)}
                hint="Через запятую"
              />
            </Section>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Сохранено
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-5">{title}</h3>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  disabled?: boolean;
  hint?: string;
  icon?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  textarea = false,
  disabled = false,
  hint,
  icon,
}) => (
  <div className={disabled ? 'opacity-40 pointer-events-none' : ''}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          }`}
        />
      )}
    </div>
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

export default SiteSettingsManager;
