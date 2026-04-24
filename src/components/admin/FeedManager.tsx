import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import type { FeedSettings, Product } from '../../types/index';

const DEFAULT_SETTINGS: FeedSettings = {
  shopName: '',
  companyName: '',
  currency: 'RUR',
  enableFeed: true,
  includeOutOfStock: true,
  priceType: 'min',
  excludedProductIds: [],
  enableDelivery: false,
  deliveryCost: 0,
  deliveryDays: 1,
  orderBefore: 0,
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
};

type Section = 'shop' | 'selection' | 'products' | 'delivery' | 'utm';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'shop', label: 'Магазин' },
  { id: 'selection', label: 'Выбор товаров' },
  { id: 'products', label: 'Товары' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'utm', label: 'UTM-метки' },
];

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-3 group">
      <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

/* ─── Секция выбора товаров ─── */
function ProductSelection({
  products,
  excludedIds,
  onChange,
}: {
  products: Product[];
  excludedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const excluded = useMemo(() => new Set(excludedIds), [excludedIds]);

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))).sort(),
    [products],
  );

  const visible = useMemo(() => {
    let list = products;
    if (filterCat) list = list.filter(p => p.category === filterCat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, filterCat, search]);

  const includedCount = products.length - excluded.size;
  const allVisibleIncluded = visible.every(p => !excluded.has(p.id));

  const toggleProduct = (id: string) => {
    const next = new Set(excluded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const toggleAllVisible = () => {
    const next = new Set(excluded);
    if (allVisibleIncluded) {
      visible.forEach(p => next.add(p.id));
    } else {
      visible.forEach(p => next.delete(p.id));
    }
    onChange(Array.from(next));
  };

  const includeAll = () => onChange([]);
  const excludeAll = () => onChange(products.map(p => p.id));

  return (
    <div className="space-y-4">
      {/* Счётчик + быстрые действия */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-gray-600">
          В фиде:{' '}
          <span className="font-semibold text-gray-900">{includedCount}</span>{' '}
          из <span className="font-semibold">{products.length}</span> товаров
          {excluded.size > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {excluded.size} исключено
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={includeAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Включить все
          </button>
          <button
            type="button"
            onClick={excludeAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Исключить все
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по названию…"
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Таблица товаров */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Шапка с чекбоксом "все видимые" */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <input
            type="checkbox"
            id="select-all-visible"
            checked={allVisibleIncluded && visible.length > 0}
            onChange={toggleAllVisible}
            className="h-4 w-4 rounded accent-primary-600"
          />
          <label htmlFor="select-all-visible" className="text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer">
            {allVisibleIncluded ? 'Снять все на странице' : 'Выбрать все на странице'}
          </label>
          <span className="ml-auto text-xs text-gray-400">{visible.length} товаров</span>
        </div>

        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Ничего не найдено
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
            {visible.map(p => {
              const included = !excluded.has(p.id);
              return (
                <li
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    included ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60 hover:opacity-80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={() => toggleProduct(p.id)}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 rounded accent-primary-600 shrink-0"
                  />
                  {p.image && (
                    <img
                      src={p.image}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover shrink-0 bg-gray-100"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${included ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{p.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      {p.price.toLocaleString('ru-RU')} ₽
                    </p>
                    {!p.inStock && (
                      <span className="text-xs text-gray-400">нет в наличии</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─── Основной компонент ─── */
const FeedManager = () => {
  const [settings, setSettings] = useState<FeedSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('shop');
  const [previewXml, setPreviewXml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const feedUrl = `${window.location.origin}/api/feed/yml`;

  useEffect(() => {
    Promise.all([api.feed.getSettings(), api.products.getAll()])
      .then(([s, prods]) => {
        setSettings({ ...DEFAULT_SETTINGS, ...s });
        setProducts(prods);
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof FeedSettings>(field: K, value: FeedSettings[K]) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.feed.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewXml(null);
    try {
      const xml = await api.feed.getYml();
      setPreviewXml(xml);
    } catch {
      setError('Не удалось загрузить предпросмотр фида');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(feedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const includedCount = products.length - settings.excludedProductIds.length;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Фид товаров</h2>
        <p className="text-gray-500 text-sm">
          Яндекс.Маркет YML-фид генерируется из каталога в реальном времени. Подключите его к Яндекс.Маркету, ВКонтакте или Google Merchant Center.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Статус + URL */}
      <div className="bg-gradient-to-br from-primary-50 to-elegant-50 rounded-xl border border-primary-100 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${settings.enableFeed ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className="font-semibold text-gray-800 text-sm">
                {settings.enableFeed ? 'Фид активен' : 'Фид отключён'}
              </span>
            </div>
            {settings.enableFeed && (
              <button
                type="button"
                onClick={() => setSection('selection')}
                className="text-xs text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors"
              >
                {includedCount} из {products.length} товаров — настроить выбор
              </button>
            )}
          </div>
          <Toggle value={settings.enableFeed} onChange={v => set('enableFeed', v)} label="Включить фид" />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">URL фида</p>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 font-mono truncate">
              {feedUrl}
            </code>
            <button
              onClick={handleCopyUrl}
              className="shrink-0 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? '✓ Скопировано' : 'Копировать'}
            </button>
            <a
              href={feedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2.5 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            >
              Открыть
            </a>
          </div>
        </div>
      </div>

      {/* Настройки с разделами */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Табы */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                section === s.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {s.label}
              {s.id === 'selection' && (
                <span className={`ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                  settings.excludedProductIds.length > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {settings.excludedProductIds.length > 0 ? `−${settings.excludedProductIds.length}` : `${products.length}`}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* ── Магазин ── */}
          {section === 'shop' && (
            <>
              <Field label="Название магазина" hint='Тег <name>. Если пусто — берётся из настроек сайта.'>
                <input type="text" value={settings.shopName} onChange={e => set('shopName', e.target.value)} placeholder="Цветочный рай" className={inputCls} />
              </Field>
              <Field label="Название компании" hint="Тег <company>. Если пусто — берётся название магазина.">
                <input type="text" value={settings.companyName} onChange={e => set('companyName', e.target.value)} placeholder="ООО «Цветы»" className={inputCls} />
              </Field>
              <Field label="Валюта">
                <select value={settings.currency} onChange={e => set('currency', e.target.value)} className={inputCls + ' bg-white'}>
                  <option value="RUR">Российский рубль (RUR)</option>
                  <option value="USD">Доллар США (USD)</option>
                  <option value="EUR">Евро (EUR)</option>
                </select>
              </Field>
            </>
          )}

          {/* ── Выбор товаров ── */}
          {section === 'selection' && (
            <ProductSelection
              products={products}
              excludedIds={settings.excludedProductIds}
              onChange={ids => set('excludedProductIds', ids)}
            />
          )}

          {/* ── Товары (настройки) ── */}
          {section === 'products' && (
            <>
              <Toggle
                value={settings.includeOutOfStock}
                onChange={v => set('includeOutOfStock', v)}
                label="Включать товары не в наличии (available=false)"
              />
              <Field label="Цена в фиде" hint='«Минимальная» — наименьшая цена из вариантов размера. «Базовая» — основная цена товара.'>
                <div className="flex gap-3">
                  {([['min', 'Минимальная (из размеров)'], ['base', 'Базовая цена товара']] as const).map(([val, lbl]) => (
                    <label key={val} className={`flex-1 flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${settings.priceType === val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="priceType" value={val} checked={settings.priceType === val} onChange={() => set('priceType', val)} className="accent-primary-600" />
                      <span className="text-sm text-gray-700">{lbl}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* ── Доставка ── */}
          {section === 'delivery' && (
            <>
              <Toggle value={settings.enableDelivery} onChange={v => set('enableDelivery', v)} label="Добавлять блок <delivery-options> в каждый оффер" />
              {settings.enableDelivery ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                  <Field label="Стоимость доставки, ₽" hint="0 = бесплатная">
                    <input type="number" min={0} step={1} value={settings.deliveryCost} onChange={e => set('deliveryCost', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Срок доставки, дней">
                    <input type="number" min={1} max={30} value={settings.deliveryDays} onChange={e => set('deliveryDays', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Заказать до (часов)" hint="0 = не указывать">
                    <input type="number" min={0} max={23} value={settings.orderBefore} onChange={e => set('orderBefore', Number(e.target.value))} className={inputCls} />
                  </Field>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Яндекс.Маркет будет использовать условия доставки из личного кабинета магазина.</p>
              )}
            </>
          )}

          {/* ── UTM ── */}
          {section === 'utm' && (
            <>
              <p className="text-sm text-gray-500">UTM-метки добавляются к URL каждого товара в фиде для отслеживания переходов в аналитике.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="utm_source" hint='Например: yandex, vk, google'>
                  <input type="text" value={settings.utmSource} onChange={e => set('utmSource', e.target.value)} placeholder="yandex" className={inputCls} />
                </Field>
                <Field label="utm_medium" hint='Например: cpc, feed, market'>
                  <input type="text" value={settings.utmMedium} onChange={e => set('utmMedium', e.target.value)} placeholder="cpc" className={inputCls} />
                </Field>
                <Field label="utm_campaign" hint='Например: flowers_feed'>
                  <input type="text" value={settings.utmCampaign} onChange={e => set('utmCampaign', e.target.value)} placeholder="flowers_feed" className={inputCls} />
                </Field>
              </div>
              {(settings.utmSource || settings.utmMedium || settings.utmCampaign) && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Пример URL с метками:</p>
                  <code className="text-xs text-gray-700 font-mono break-all">
                    {window.location.origin}/catalog/bouquet
                    {[
                      settings.utmSource && `utm_source=${settings.utmSource}`,
                      settings.utmMedium && `utm_medium=${settings.utmMedium}`,
                      settings.utmCampaign && `utm_campaign=${settings.utmCampaign}`,
                    ].filter(Boolean).join('&').replace(/^/, '?')}
                  </code>
                </div>
              )}
            </>
          )}
        </div>

        {/* Сохранить */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Сохраняем…' : 'Сохранить настройки'}
          </button>
          {saved && <span className="text-emerald-600 text-sm font-medium">✓ Сохранено</span>}
        </div>
      </div>

      {/* Предпросмотр */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Предпросмотр XML</h3>
            <p className="text-xs text-gray-500 mt-0.5">Показывает текущий фид с сохранёнными настройками</p>
          </div>
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {previewLoading ? 'Загрузка…' : previewXml ? 'Обновить' : 'Загрузить'}
          </button>
        </div>
        {previewXml ? (
          <pre className="p-6 text-xs text-gray-700 overflow-x-auto max-h-96 font-mono whitespace-pre-wrap break-words bg-gray-50">
            {previewXml.length > 5000 ? previewXml.slice(0, 5000) + '\n\n… (усечено)' : previewXml}
          </pre>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Нажмите «Загрузить», чтобы увидеть XML-содержимое фида
          </div>
        )}
      </div>

      {/* Как подключить */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Как подключить</h3>
        <div className="space-y-4 text-sm">
          {[
            { title: 'Яндекс.Маркет / Яндекс.Директ', text: 'Личный кабинет → «Ассортимент» → «Прайс-листы» → «Добавить прайс-лист». Укажите URL фида выше.' },
            { title: 'ВКонтакте Товары', text: 'Управление сообществом → «Товары» → «Магазин» → «Загрузить из YML» → вставьте URL фида.' },
            { title: 'Google Merchant Center', text: 'Товары → Фиды → «+» → «Запланированное получение». YML поддерживается через режим совместимости.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">{i + 1}</span>
              <div>
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-gray-500 mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedManager;
