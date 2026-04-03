import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { SalesStats, VisitsStats } from '../../types/index';

const PERIODS = [7, 30, 90] as const;

function buildDayRange(periodDays: number): string[] {
  const out: string[] = [];
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(end.getTime());
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ожидает',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  return labels[status] || status;
}

const moneyFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const StatisticsManager = () => {
  const [periodDays, setPeriodDays] = useState<(typeof PERIODS)[number]>(30);
  const [sales, setSales] = useState<SalesStats | null>(null);
  const [visits, setVisits] = useState<VisitsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [s, v] = await Promise.all([
        api.stats.getSales(periodDays),
        api.stats.getVisits(periodDays),
      ]);
      setSales(s);
      setVisits(v);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !sales && !visits) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error && !sales && !visits) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
    );
  }

  const days = buildDayRange(periodDays);
  const salesByDate = new Map((sales?.by_day ?? []).map((r) => [r.date, r]));
  const visitsByDate = new Map((visits?.by_day ?? []).map((r) => [r.date, r]));

  const salesSeries = days.map((d) => salesByDate.get(d) ?? { date: d, order_count: 0, revenue: 0 });
  const visitsSeries = days.map((d) => visitsByDate.get(d) ?? { date: d, views: 0 });

  const maxOrders = Math.max(1, ...salesSeries.map((r) => r.order_count));
  const maxRevenue = Math.max(1, ...salesSeries.map((r) => r.revenue));
  const maxViews = Math.max(1, ...visitsSeries.map((r) => r.views));
  const maxTopPath = Math.max(1, ...(visits?.top_paths ?? []).map((p) => p.count));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-gray-600 text-sm">
          Выручка без учёта заказов со статусом «Отменён». Период по дате создания заказа.
        </p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {PERIODS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setPeriodDays(d)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                periodDays === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d} дн.
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Обновление…</p>
      )}

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Продажи</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Выручка за период</p>
            <p className="text-3xl font-bold text-primary-800">
              {moneyFmt.format(sales?.revenue_total ?? 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Заказов</p>
            <p className="text-3xl font-bold text-gray-900">{sales?.total_orders ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Заказы по дням</h3>
            <div className="flex items-end gap-0.5 h-40 border-b border-gray-200 pb-1">
              {salesSeries.map((row) => (
                <div
                  key={row.date}
                  className="flex-1 min-w-0 flex flex-col justify-end group"
                  title={`${row.date}: ${row.order_count}`}
                >
                  <div
                    className="w-full rounded-t bg-primary-500/90 hover:bg-primary-600 transition-colors mx-px"
                    style={{ height: `${(row.order_count / maxOrders) * 100}%`, minHeight: row.order_count ? 4 : 0 }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {days[0]} — {days[days.length - 1]}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Выручка по дням</h3>
            <div className="flex items-end gap-0.5 h-40 border-b border-gray-200 pb-1">
              {salesSeries.map((row) => (
                <div
                  key={`${row.date}-rev`}
                  className="flex-1 min-w-0 flex flex-col justify-end"
                  title={`${row.date}: ${moneyFmt.format(row.revenue)}`}
                >
                  <div
                    className="w-full rounded-t bg-emerald-500/85 hover:bg-emerald-600 transition-colors mx-px"
                    style={{ height: `${(row.revenue / maxRevenue) * 100}%`, minHeight: row.revenue ? 4 : 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {(sales?.by_status?.length ?? 0) > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">По статусам</h3>
            <div className="flex flex-wrap gap-2">
              {sales!.by_status.map((s) => (
                <span
                  key={s.status}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800">{statusLabel(s.status)}</span>
                  <span className="text-gray-500">{s.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Посещаемость</h2>
        <p className="text-sm text-gray-600 mb-4">
          Просмотры страниц (SPA-переходы), без учёта раздела администратора.
        </p>
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
          <p className="text-sm text-gray-500 mb-1">Просмотров за период</p>
          <p className="text-3xl font-bold text-gray-900">{visits?.total_views ?? 0}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Просмотры по дням</h3>
            <div className="flex items-end gap-0.5 h-40 border-b border-gray-200 pb-1">
              {visitsSeries.map((row) => (
                <div
                  key={row.date}
                  className="flex-1 min-w-0 flex flex-col justify-end"
                  title={`${row.date}: ${row.views}`}
                >
                  <div
                    className="w-full rounded-t bg-violet-500/85 hover:bg-violet-600 transition-colors mx-px"
                    style={{ height: `${(row.views / maxViews) * 100}%`, minHeight: row.views ? 4 : 0 }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {days[0]} — {days[days.length - 1]}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Популярные пути</h3>
            {(visits?.top_paths?.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-500">Пока нет данных — откройте сайт в другой вкладке.</p>
            ) : (
              <ul className="space-y-3">
                {visits!.top_paths.map((p) => (
                  <li key={p.path} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${(p.count / maxTopPath) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1 font-mono">{p.path}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">
                      {p.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatisticsManager;
