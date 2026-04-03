import React, { useState, useEffect, useRef } from 'react';
import { useAppearance, COLOR_THEMES, FONT_PAIRS } from '../../context/AppearanceContext';
import { api } from '../../services/api';
import type {
  AppearanceSettings,
  ColorTheme,
  FontPair,
  CatalogColumns,
  ProductCardStyle,
} from '../../types/index';

const AppearanceManager: React.FC = () => {
  const { appearance, updateAppearance } = useAppearance();
  const [local, setLocal] = useState<AppearanceSettings>({ ...appearance });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('colors');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal({ ...appearance });
  }, [appearance]);

  const set = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateAppearance(local);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Не удалось сохранить. Проверьте подключение к серверу.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Сбросить все настройки внешнего вида к значениям по умолчанию?');
    if (!confirmed) return;
    const def: AppearanceSettings = {
      colorTheme: 'rose',
      fontPair: 'default',
      logoUrl: '',
      faviconUrl: '',
      bannerBgImage: '',
      bannerBgColor: '',
      bannerButtonText: '',
      bannerButtonLink: '',
      darkModeEnabled: false,
      catalogColumns: '3',
      productCardStyle: 'default',
      footerCopyright: '',
    };
    setLocal(def);
    await updateAppearance(def);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'colors',  label: 'Цвета',       icon: <PaletteIcon /> },
    { id: 'fonts',   label: 'Шрифты',      icon: <FontIcon /> },
    { id: 'logo',    label: 'Логотип',     icon: <ImageIcon /> },
    { id: 'banner',  label: 'Баннер',      icon: <BannerIcon /> },
    { id: 'darkmode',label: 'Тема',        icon: <MoonIcon /> },
    { id: 'layout',  label: 'Макет',       icon: <LayoutIcon /> },
    { id: 'footer',  label: 'Футер',       icon: <FooterIcon /> },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <nav className="flex flex-col gap-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                activeSection === s.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="w-5 h-5 flex-shrink-0">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-8">

          {/* ── Colors ─────────────────────────────────── */}
          {activeSection === 'colors' && (
            <Section title="Цветовая схема">
              <p className="text-sm text-gray-500 -mt-3">
                Выберите готовую палитру — она применится ко всем акцентным элементам сайта.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.keys(COLOR_THEMES) as ColorTheme[]).map(theme => (
                  <ThemeCard
                    key={theme}
                    theme={theme}
                    selected={local.colorTheme === theme}
                    onSelect={() => set('colorTheme', theme)}
                  />
                ))}
              </div>
              <LivePreview label="Предпросмотр цвета">
                <div className="flex gap-3 flex-wrap">
                  {(['50','100','200','300','400','500','600','700','800','900'] as const).map(shade => {
                    const palette = COLOR_THEMES[local.colorTheme] ?? COLOR_THEMES.rose;
                    return (
                      <div key={shade} className="text-center">
                        <div
                          className="w-10 h-10 rounded-lg shadow-sm border border-black/5"
                          style={{ backgroundColor: palette[`--p${shade}`] }}
                        />
                        <span className="text-xs text-gray-400 mt-1 block">{shade}</span>
                      </div>
                    );
                  })}
                </div>
              </LivePreview>
            </Section>
          )}

          {/* ── Fonts ──────────────────────────────────── */}
          {activeSection === 'fonts' && (
            <Section title="Шрифты">
              <p className="text-sm text-gray-500 -mt-3">
                Выберите пару шрифтов — первый для заголовков, второй для основного текста.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(FONT_PAIRS) as FontPair[]).map(pair => {
                  const fonts = FONT_PAIRS[pair];
                  return (
                    <button
                      key={pair}
                      onClick={() => set('fontPair', pair)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        local.fontPair === pair
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        {FONT_PAIR_LABELS[pair]}
                      </div>
                      <div
                        className="text-xl font-bold text-gray-900 leading-tight mb-1"
                        style={{ fontFamily: `'${fonts.heading}', serif` }}
                      >
                        Заголовок
                      </div>
                      <div
                        className="text-sm text-gray-600"
                        style={{ fontFamily: `'${fonts.body}', sans-serif` }}
                      >
                        Основной текст · {fonts.heading} + {fonts.body}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ── Logo ───────────────────────────────────── */}
          {activeSection === 'logo' && (
            <Section title="Логотип и фавикон">
              <ImageUrlField
                label="URL логотипа"
                placeholder="https://example.com/logo.png"
                value={local.logoUrl}
                onChange={v => set('logoUrl', v)}
                hint="PNG или SVG с прозрачным фоном, рекомендуемая высота 40–60 px. Можно вставить ссылку или загрузить файл."
                uploadLabel="Загрузить логотип"
                uploading={uploadingLogo}
                inputRef={logoFileRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onPickFile={async file => {
                  setUploadError(null);
                  setUploadingLogo(true);
                  try {
                    const { url } = await api.appearance.uploadAsset(file, 'logo');
                    set('logoUrl', url);
                  } catch {
                    setUploadError('Не удалось загрузить логотип.');
                  } finally {
                    setUploadingLogo(false);
                    if (logoFileRef.current) logoFileRef.current.value = '';
                  }
                }}
              />
              {local.logoUrl && (
                <LivePreview label="Предпросмотр логотипа">
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl w-fit">
                    <img
                      src={local.logoUrl}
                      alt="logo"
                      className="h-10 object-contain"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="text-base font-bold text-gray-900 font-serif">
                      Название магазина
                    </span>
                  </div>
                </LivePreview>
              )}
              <ImageUrlField
                label="URL фавикона"
                placeholder="https://example.com/favicon.ico"
                value={local.faviconUrl}
                onChange={v => set('faviconUrl', v)}
                hint="ICO, PNG 32×32 или 16×16. Можно вставить ссылку или загрузить файл."
                uploadLabel="Загрузить фавикон"
                uploading={uploadingFavicon}
                inputRef={faviconFileRef}
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon,.ico"
                onPickFile={async file => {
                  setUploadError(null);
                  setUploadingFavicon(true);
                  try {
                    const { url } = await api.appearance.uploadAsset(file, 'favicon');
                    set('faviconUrl', url);
                  } catch {
                    setUploadError('Не удалось загрузить фавикон.');
                  } finally {
                    setUploadingFavicon(false);
                    if (faviconFileRef.current) faviconFileRef.current.value = '';
                  }
                }}
              />
              {local.faviconUrl && (
                <LivePreview label="Предпросмотр фавикона">
                  <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl w-fit">
                    <img
                      src={local.faviconUrl}
                      alt="favicon"
                      className="w-8 h-8 object-contain rounded"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="text-sm text-gray-600">Как в браузере</span>
                  </div>
                </LivePreview>
              )}
              {uploadError && activeSection === 'logo' && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
            </Section>
          )}

          {/* ── Banner ─────────────────────────────────── */}
          {activeSection === 'banner' && (
            <Section title="Визуальное оформление баннера">
              <p className="text-sm text-gray-500 -mt-3">
                Текст и переключатель баннера — в разделе «Настройки сайта → Баннер».
              </p>
              <ImageUrlField
                label="Изображение баннера"
                placeholder="https://example.com/hero.jpg"
                value={local.bannerBgImage}
                onChange={v => set('bannerBgImage', v)}
                hint="Показывается в правой части баннера на главной (как иллюстрация). Можно вставить ссылку или загрузить файл."
                uploadLabel="Загрузить изображение"
                uploading={uploadingBanner}
                inputRef={bannerFileRef}
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onPickFile={async file => {
                  setUploadError(null);
                  setUploadingBanner(true);
                  try {
                    const { url } = await api.appearance.uploadAsset(file, 'banner');
                    set('bannerBgImage', url);
                  } catch {
                    setUploadError('Не удалось загрузить изображение баннера.');
                  } finally {
                    setUploadingBanner(false);
                    if (bannerFileRef.current) bannerFileRef.current.value = '';
                  }
                }}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Цвет фона баннера
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={local.bannerBgColor || '#fdf4f5'}
                    onChange={e => set('bannerBgColor', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={local.bannerBgColor}
                    onChange={e => set('bannerBgColor', e.target.value)}
                    placeholder="#fdf4f5"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  {local.bannerBgColor && (
                    <button
                      onClick={() => set('bannerBgColor', '')}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Фон полосы баннера за текстом и картинкой (если не задан — градиент по умолчанию)
                </p>
              </div>
              <Field
                label="Текст кнопки баннера"
                placeholder="Смотреть каталог"
                value={local.bannerButtonText}
                onChange={v => set('bannerButtonText', v)}
              />
              <Field
                label="Ссылка кнопки баннера"
                placeholder="/catalog"
                value={local.bannerButtonLink}
                onChange={v => set('bannerButtonLink', v)}
              />
              {uploadError && activeSection === 'banner' && (
                <p className="text-sm text-red-600 -mt-2">{uploadError}</p>
              )}
              {(local.bannerBgImage || local.bannerBgColor) && (
                <LivePreview label="Предпросмотр баннера">
                  <div
                    className={`w-full rounded-xl overflow-hidden flex items-stretch gap-4 p-4 border border-gray-200 ${
                      local.bannerBgColor ? '' : 'bg-gradient-to-br from-primary-50 via-white to-elegant-50'
                    }`}
                    style={local.bannerBgColor ? { backgroundColor: local.bannerBgColor } : undefined}
                  >
                    <div
                      className={`flex-1 min-w-0 flex flex-col justify-center text-left ${
                        local.bannerBgColor ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      <p className="font-bold text-sm font-serif">Заголовок баннера</p>
                      <p className={`text-xs mt-1 ${local.bannerBgColor ? 'text-white/80' : 'text-gray-500'}`}>
                        Подзаголовок
                      </p>
                      {local.bannerButtonText && (
                        <span className="mt-3 inline-block bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg w-fit">
                          {local.bannerButtonText}
                        </span>
                      )}
                    </div>
                    <div className="w-32 sm:w-40 shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-md aspect-[4/3]">
                      {local.bannerBgImage ? (
                        <img
                          src={local.bannerBgImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                          стандартное фото
                        </div>
                      )}
                    </div>
                  </div>
                </LivePreview>
              )}
            </Section>
          )}

          {/* ── Dark mode ──────────────────────────────── */}
          {activeSection === 'darkmode' && (
            <Section title="Светлая / тёмная тема">
              <p className="text-sm text-gray-500 -mt-3">
                Тёмная тема инвертирует фон страницы и основные блоки контента.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => set('darkModeEnabled', false)}
                  className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    !local.darkModeEnabled ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <SunIcon className="w-8 h-8 text-amber-400" />
                  <span className="text-sm font-semibold text-gray-800">Светлая</span>
                </button>
                <button
                  onClick={() => set('darkModeEnabled', true)}
                  className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    local.darkModeEnabled ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <MoonIconLarge className="w-8 h-8 text-indigo-400" />
                  <span className="text-sm font-semibold text-gray-800">Тёмная</span>
                </button>
              </div>
              <div className={`rounded-xl p-4 text-sm ${local.darkModeEnabled ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-700'}`}>
                {local.darkModeEnabled
                  ? '🌙 Тёмный режим включён — фон страниц станет тёмно-серым.'
                  : '☀️ Светлый режим — стандартное отображение.'}
              </div>
            </Section>
          )}

          {/* ── Layout ─────────────────────────────────── */}
          {activeSection === 'layout' && (
            <Section title="Макет каталога">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Количество колонок товаров
                </label>
                <div className="flex gap-3">
                  {(['2', '3', '4'] as CatalogColumns[]).map(col => (
                    <button
                      key={col}
                      onClick={() => set('catalogColumns', col)}
                      className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                        local.catalogColumns === col
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {col} колонки
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Стиль карточки товара
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(CARD_STYLE_LABELS) as [ProductCardStyle, string][]).map(([style, label]) => (
                    <button
                      key={style}
                      onClick={() => set('productCardStyle', style)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        local.productCardStyle === style
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CardStylePreview style={style} />
                      <span className="text-xs font-medium text-gray-700 mt-2 block">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <LivePreview label="Предпросмотр сетки">
                <div className={`grid gap-3 ${COLUMNS_CLASS[local.catalogColumns]}`}>
                  {Array.from({ length: parseInt(local.catalogColumns) }).map((_, i) => (
                    <div
                      key={i}
                      className={`bg-gray-100 rounded-xl h-24 flex items-end p-2 ${
                        local.productCardStyle === 'bordered' ? 'border-2 border-gray-300' :
                        local.productCardStyle === 'minimal' ? 'shadow-none' : 'shadow-md'
                      }`}
                    >
                      <div className="w-full">
                        <div className="h-2 bg-gray-300 rounded mb-1 w-3/4" />
                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </LivePreview>
            </Section>
          )}

          {/* ── Footer ─────────────────────────────────── */}
          {activeSection === 'footer' && (
            <Section title="Футер">
              <Field
                label="Копирайт"
                placeholder={`© ${new Date().getFullYear()} Название магазина`}
                value={local.footerCopyright}
                onChange={v => set('footerCopyright', v)}
                hint="Если не заполнено, используется автоматический формат с текущим годом и названием магазина"
              />
              <p className="text-sm text-gray-400">
                Ссылки в футере и контакты настраиваются в разделе «Настройки сайта».
              </p>
            </Section>
          )}

          {/* Save bar */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
            >
              Сбросить всё
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Сохранено и применено
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-600">{saveError}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Helpers ────────────────────────────────────────────────── */

const FONT_PAIR_LABELS: Record<FontPair, string> = {
  default: 'Классический',
  modern:  'Современный',
  classic: 'Элегантный',
  minimal: 'Минималистичный',
};

const CARD_STYLE_LABELS: Record<ProductCardStyle, string> = {
  default:  'Стандарт',
  minimal:  'Минимал',
  bordered: 'С рамкой',
};

const COLUMNS_CLASS: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
};

const COLOR_THEME_NAMES: Record<ColorTheme, string> = {
  rose:    'Роза',
  violet:  'Фиолет',
  blue:    'Синий',
  emerald: 'Изумруд',
  amber:   'Янтарь',
};

/* ── Sub-components ─────────────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-5">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {children}
  </div>
);

const LivePreview: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">{children}</div>
  </div>
);

interface FieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

const Field: React.FC<FieldProps> = ({ label, placeholder, value, onChange, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
    />
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

interface ImageUrlFieldProps extends FieldProps {
  uploadLabel: string;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onPickFile: (file: File) => void | Promise<void>;
}

const ImageUrlField: React.FC<ImageUrlFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  hint,
  uploadLabel,
  uploading,
  inputRef,
  accept,
  onPickFile,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
      />
      <div className="flex shrink-0">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) void onPickFile(f);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Загрузка…' : uploadLabel}
        </button>
      </div>
    </div>
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
);

const ThemeCard: React.FC<{
  theme: ColorTheme;
  selected: boolean;
  onSelect: () => void;
}> = ({ theme, selected, onSelect }) => {
  const palette = COLOR_THEMES[theme];
  const swatches = ['--p300', '--p500', '--p700'];
  return (
    <button
      onClick={onSelect}
      className={`p-3 rounded-xl border-2 text-left transition-all ${
        selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex gap-1.5 mb-2">
        {swatches.map(s => (
          <div
            key={s}
            className="w-6 h-6 rounded-full shadow-sm"
            style={{ backgroundColor: palette[s] }}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-800">{COLOR_THEME_NAMES[theme]}</span>
    </button>
  );
};

const CardStylePreview: React.FC<{ style: ProductCardStyle }> = ({ style }) => (
  <div
    className={`w-full h-12 bg-gray-100 rounded-lg flex items-end p-1.5 ${
      style === 'bordered' ? 'border-2 border-gray-400' :
      style === 'minimal' ? '' : 'shadow-md'
    }`}
  >
    <div className="w-full space-y-1">
      <div className="h-1.5 bg-gray-300 rounded w-3/4" />
      <div className="h-1.5 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

/* ── Icons ──────────────────────────────────────────────────── */

const PaletteIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);
const FontIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
  </svg>
);
const ImageIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const BannerIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);
const MoonIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
const LayoutIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const FooterIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 20h16M4 16h16M4 4h16v8H4z" />
  </svg>
);
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);
const MoonIconLarge: React.FC<{ className?: string }> = ({ className }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default AppearanceManager;
