import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Phone,
  MessageCircle,
  UserCheck,
  PhoneOff,
  Percent,
  Calendar,
  ChevronDown,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import service from "../../api/axios";
import {
  buildDashboardCacheKey,
  getDashboardCache,
  setDashboardCache,
} from "../../utils/callsDashboardCache";

const COLORS = {
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#a855f7",
};

const defaultEnd = moment().format("YYYY-MM-DD");
const defaultStart = moment().subtract(14, "days").format("YYYY-MM-DD");

const MetricCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
    <div
      className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}18` }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

const DonutPanel = ({ title, data }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                dataKey="count"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [val, name]}
                contentStyle={{ borderRadius: 8, fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2.5 min-w-0">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>
              <span className="text-gray-800 font-medium whitespace-nowrap">
                {item.count.toLocaleString()}{" "}
                <span className="text-gray-400 font-normal">({item.percentage}%)</span>
              </span>
            </div>
          ))}
          {total === 0 && (
            <p className="text-xs text-gray-400">No data for selected range</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FunnelChart = ({ funnel }) => {
  const steps = [
    { label: "Total Calls", ...funnel.total_calls, color: COLORS.blue },
    { label: "Conversations Started", ...funnel.conversations_started, color: COLORS.green },
    { label: "Interested Leads", ...funnel.interested_leads, color: COLORS.orange },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Conversion Funnel</h3>
      <div className="flex flex-1 gap-6 items-center">
        <div className="flex-1 flex flex-col items-center gap-1 py-2">
          {steps.map((step, i) => {
            const widthPct = 100 - i * 22;
            return (
              <div
                key={step.label}
                className="relative flex items-center justify-center text-white text-xs font-medium transition-all"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: step.color,
                  height: i === 0 ? 56 : i === 1 ? 48 : 40,
                  clipPath:
                    i < steps.length - 1
                      ? "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)"
                      : "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)",
                  borderRadius: i === steps.length - 1 ? "0 0 6px 6px" : 0,
                }}
              >
                <span className="drop-shadow-sm">{step.count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
        <div className="space-y-4 shrink-0 w-44">
          {steps.map((step) => (
            <div key={step.label}>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
                <span className="text-sm text-gray-600">{step.label}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 ml-4">
                {step.count.toLocaleString()}{" "}
                <span className="text-gray-400 font-normal">({step.percentage}%)</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Overall Conversion Rate (Interested)</span>
        <span className="text-lg font-bold text-green-600">
          {funnel.overall_conversion_rate}%
        </span>
      </div>
    </div>
  );
};

const statusBadge = (status) => {
  const map = {
    completed: "bg-green-100 text-green-700",
    busy: "bg-orange-100 text-orange-700",
    "no-answer": "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    initiated: "bg-blue-100 text-blue-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const leadBadge = (type) => {
  const map = {
    hot: "bg-green-100 text-green-700",
    warm: "bg-orange-100 text-orange-700",
    cold: "bg-red-100 text-red-700",
  };
  return map[type] || "bg-gray-100 text-gray-700";
};

const initialCacheKey = buildDashboardCacheKey(1, defaultStart, defaultEnd);
const initialCachedData = getDashboardCache(initialCacheKey);

const CallsDashboard = () => {
  const [loading, setLoading] = useState(!initialCachedData);
  const [data, setData] = useState(initialCachedData);
  const [fromCache, setFromCache] = useState(!!initialCachedData);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [page, setPage] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draftStart, setDraftStart] = useState(defaultStart);
  const [draftEnd, setDraftEnd] = useState(defaultEnd);
  const [selectedCall, setSelectedCall] = useState(null);

  const fetchDashboard = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = buildDashboardCacheKey(page, startDate, endDate);

      if (!forceRefresh) {
        const cached = getDashboardCache(cacheKey);
        if (cached) {
          setData(cached);
          setFromCache(true);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setFromCache(false);

      try {
        const res = await service.get("calls-dashboard/overview", {
          params: {
            page,
            start_date: startDate,
            end_date: endDate,
          },
        });
        const payload = res?.data?.data;
        if (payload) {
          setDashboardCache(cacheKey, payload);
          setData(payload);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        toast.error(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    },
    [page, startDate, endDate]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const applyDateFilter = () => {
    if (draftStart && draftEnd && moment(draftStart).isAfter(draftEnd)) {
      toast.error("Start date must be before end date");
      return;
    }
    setStartDate(draftStart);
    setEndDate(draftEnd);
    setPage(1);
    setShowDatePicker(false);
  };

  const dateLabel = `${moment(startDate).format("DD MMM YYYY")} - ${moment(endDate).format("DD MMM YYYY")}`;

  const dailyVolume = useMemo(
    () =>
      (data?.daily_call_volume || []).map((d) => ({
        date: moment(d.date).format("DD MMM"),
        count: d.count,
        fullDate: d.date,
      })),
    [data]
  );

  const engagementData = useMemo(() => {
    const eb = data?.engagement_breakdown;
    if (!eb) return [];
    return [
      {
        name: "Engaged Calls",
        count: eb.engaged_calls?.count ?? 0,
        percentage: eb.engaged_calls?.percentage ?? 0,
        color: COLORS.green,
      },
      {
        name: "No Engagement",
        count: eb.no_engagement?.count ?? 0,
        percentage: eb.no_engagement?.percentage ?? 0,
        color: COLORS.red,
      },
    ];
  }, [data]);

  const leadData = useMemo(() => {
    const lq = data?.lead_qualification;
    if (!lq) return [];
    return [
      {
        name: "Hot Leads (Interested)",
        count: lq.hot_leads_interested?.count ?? 0,
        percentage: lq.hot_leads_interested?.percentage ?? 0,
        color: COLORS.green,
      },
      {
        name: "Warm Leads (Engaged)",
        count: lq.warm_leads_engaged?.count ?? 0,
        percentage: lq.warm_leads_engaged?.percentage ?? 0,
        color: COLORS.orange,
      },
      {
        name: "Cold Leads (No Response)",
        count: lq.cold_leads_no_response?.count ?? 0,
        percentage: lq.cold_leads_no_response?.percentage ?? 0,
        color: COLORS.red,
      },
    ];
  }, [data]);

  const sentimentData = useMemo(() => {
    const so = data?.sentiment_overview;
    if (!so) return [];
    return [
      {
        name: "Positive",
        count: so.positive?.count ?? 0,
        percentage: so.positive?.percentage ?? 0,
        color: COLORS.green,
      },
      {
        name: "Neutral",
        count: so.neutral?.count ?? 0,
        percentage: so.neutral?.percentage ?? 0,
        color: COLORS.orange,
      },
      {
        name: "Negative / No Response",
        count: so.negative_no_response?.count ?? 0,
        percentage: so.negative_no_response?.percentage ?? 0,
        color: COLORS.red,
      },
    ];
  }, [data]);

  const km = data?.key_metrics;
  const funnel = data?.funnel;
  const calls = data?.calls;
  const totals = data?.totals;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Key metrics and performance summary
            {fromCache && !loading && (
              <span className="ml-2 text-xs text-blue-500">(cached)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setDraftStart(startDate);
                setDraftEnd(endDate);
                setShowDatePicker((v) => !v);
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:border-gray-300 shadow-sm transition"
            >
              <Calendar size={16} className="text-gray-400" />
              <span>{dateLabel}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Start Date</label>
                    <input
                      type="date"
                      value={draftStart}
                      onChange={(e) => setDraftStart(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">End Date</label>
                    <input
                      type="date"
                      value={draftEnd}
                      onChange={(e) => setDraftEnd(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={applyDateFilter}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg font-medium"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 shadow-sm disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw size={16} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {km && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <MetricCard
            icon={Phone}
            label="Total Calls"
            value={km.total_calls?.count?.toLocaleString() ?? "0"}
            subtext={`${km.total_calls?.percentage ?? 0}% of total`}
            color={COLORS.blue}
          />
          <MetricCard
            icon={MessageCircle}
            label="Conversations Started"
            value={km.conversations_started?.count?.toLocaleString() ?? "0"}
            subtext={`${km.conversations_started?.percentage ?? 0}% of total`}
            color={COLORS.green}
          />
          <MetricCard
            icon={UserCheck}
            label="Interested Leads"
            value={km.interested_leads?.count?.toLocaleString() ?? "0"}
            subtext={`${km.interested_leads?.percentage ?? 0}% of total`}
            color={COLORS.orange}
          />
          <MetricCard
            icon={PhoneOff}
            label="No Engagement / Lost"
            value={km.no_engagement_lost?.count?.toLocaleString() ?? "0"}
            subtext={`${km.no_engagement_lost?.percentage ?? 0}% of total`}
            color={COLORS.red}
          />
          <MetricCard
            icon={Percent}
            label="Engagement Rate"
            value={`${km.engagement_rate ?? 0}%`}
            subtext="Conversations / Calls"
            color={COLORS.purple}
          />
        </div>
      )}

      {/* Totals row */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Duration", value: `${totals.total_duration_minutes} min` },
            { label: "Signup Calls", value: totals.signup_calls },
            { label: "Regular Calls", value: totals.regular_calls?.toLocaleString() },
            {
              label: "OpenAI Analyzed",
              value: data?.analytics_meta?.openai_analyzed ?? "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-lg border border-gray-100 px-4 py-3 text-center shadow-sm"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-lg font-bold text-gray-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Funnel + Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {funnel && <FunnelChart funnel={funnel} />}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Daily Call Volume</h3>
          <div className="h-64">
            {dailyVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyVolume} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    formatter={(val) => [val, "Calls"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullDate
                        ? moment(payload[0].payload.fullDate).format("DD MMM YYYY")
                        : ""
                    }
                  />
                  <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11, fill: "#6b7280" }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No call volume data for this range
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DonutPanel title="Engagement Breakdown" data={engagementData} />
        <DonutPanel title="Lead Qualification" data={leadData} />
        <DonutPanel title="Sentiment Overview" data={sentimentData} />
      </div>

      {/* Call Status Breakdown */}
      {data?.call_status_breakdown?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Call Status Breakdown</h3>
          <div className="space-y-3">
            {data.call_status_breakdown.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 capitalize shrink-0">
                  {item.status.replace("-", " ")}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-28 text-right shrink-0">
                  {item.count.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calls Table */}
      {calls && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-800">Recent Calls</h3>
            <span className="text-sm text-gray-500">
              Showing {calls.data?.length ?? 0} of {calls.total?.toLocaleString()} calls
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Direction</th>
                  <th className="px-4 py-3">Lead Type</th>
                  <th className="px-4 py-3">Sentiment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Transcript</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(calls.data || []).map((call) => (
                  <tr key={call.two_way_log_id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium text-gray-800">{call.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(call.call_status)}`}>
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{call.duration_minutes} min</td>
                    <td className="px-4 py-3 text-gray-600">${call.call_cost ?? "0.00"}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{call.direction}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${leadBadge(call.lead_type)}`}>
                        {call.lead_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {call.sentiment?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {moment(call.created_at).format("DD MMM YYYY, HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      {call.transcript?.length > 0 ? (
                        <button
                          onClick={() => setSelectedCall(call)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {calls.last_page > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {calls.current_page} of {calls.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(calls.last_page, p + 1))}
                disabled={page >= calls.last_page || loading}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transcript Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Call Transcript</h3>
                <p className="text-sm text-gray-500">{selectedCall.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {(selectedCall.transcript || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-50 text-blue-900 ml-4"
                      : msg.role === "assistant"
                        ? "bg-gray-50 text-gray-800 mr-4"
                        : "bg-gray-100 text-gray-500 text-xs italic"
                  }`}
                >
                  <span className="font-semibold capitalize text-xs block mb-1 opacity-70">
                    {msg.role}
                  </span>
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsDashboard;
