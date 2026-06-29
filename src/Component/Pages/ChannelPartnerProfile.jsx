import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import {
  createChannelPartnerDocuments,
  getChannelPartnerDocumentsByUserId,
  getChannelPartners,
  getUserProfile,
  updateChannelPartnerDocumentsByUserId,
} from "../../hooks/useAuth";

export default function ChannelPartnerProfile() {
  const role = String(Cookies.get("role") || "").trim().toLowerCase();
  const currentEmail = String(Cookies.get("email") || "").trim().toLowerCase();
  const currentPhone = String(Cookies.get("contact_no") || "").trim();
  const currentName = String(Cookies.get("name") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [profileUserId, setProfileUserId] = useState("");
  const [profileRow, setProfileRow] = useState(null);

  const [docsLoading, setDocsLoading] = useState(false);
  const [docsSaving, setDocsSaving] = useState(false);
  const [docsExists, setDocsExists] = useState(false);
  const [docsForm, setDocsForm] = useState({
    aadhar_number: "",
    aadhar_image: null,
    pan_number: "",
    pan_image: null,
    gst_number: "",
    gst_certificate_image: null,
    bank_detail_image: null,
    bank_account_number: "",
    bank_account_name: "",
    bank_account_type: "",
    bank_name: "",
    bank_ifsc: "",
  });

  const updateDocsForm = (key, value) => setDocsForm((p) => ({ ...p, [key]: value }));

  const availableMinutes = useMemo(() => {
    const r = profileRow;
    if (!r) return 0;
    const om = r?.omni_minute ?? r?.omniMinute ?? null;
    const omniRaw =
      om && typeof om === "object"
        ? om?.minute ?? om?.minutes ?? om?.remaining_minute ?? om?.remainingMinute
        : om;
    const n = Number(omniRaw ?? r?.minute ?? r?.minutes ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [profileRow]);

  const hydrateDocsFromPayload = (payload) => {
    const r = payload?.data?.data ?? payload?.data ?? payload ?? null;
    const doc = Array.isArray(r) ? r[0] : r;
    if (!doc || typeof doc !== "object") {
      setDocsExists(false);
      setDocsForm((p) => ({
        ...p,
        aadhar_number: "",
        pan_number: "",
        gst_number: "",
        bank_account_number: "",
        bank_account_name: "",
        bank_account_type: "",
        bank_name: "",
        bank_ifsc: "",
        aadhar_image: null,
        pan_image: null,
        gst_certificate_image: null,
        bank_detail_image: null,
      }));
      return;
    }

    setDocsExists(true);
    setDocsForm((p) => ({
      ...p,
      aadhar_number: String(doc?.aadhar_number ?? doc?.aadhar ?? ""),
      pan_number: String(doc?.pan_number ?? doc?.pan ?? ""),
      gst_number: String(doc?.gst_number ?? doc?.gst ?? ""),
      bank_account_number: String(doc?.bank_account_number ?? doc?.bank_ac_no ?? ""),
      bank_account_name: String(doc?.bank_account_name ?? doc?.bank_ac_name ?? ""),
      bank_account_type: String(doc?.bank_account_type ?? doc?.account_type ?? doc?.type_of_account ?? ""),
      bank_name: String(doc?.bank_name ?? ""),
      bank_ifsc: String(doc?.bank_ifsc ?? doc?.ifsc ?? ""),
      aadhar_image: null,
      pan_image: null,
      gst_certificate_image: null,
      bank_detail_image: null,
    }));
  };

  const fetchDocs = async (uid) => {
    const userId = String(uid || "").trim();
    if (!userId) return;
    setDocsLoading(true);
    try {
      const res = await getChannelPartnerDocumentsByUserId(userId);
      if (res && typeof res === "object" && res.status === false) {
        setDocsExists(false);
        return;
      }
      hydrateDocsFromPayload(res);
    } catch (e) {
      console.warn("documents fetch failed:", e);
      setDocsExists(false);
    } finally {
      setDocsLoading(false);
    }
  };

  const saveDocs = async () => {
    if (!profileUserId) return toast.error("User id not found");
    setDocsSaving(true);
    try {
      if (docsExists) {
        await updateChannelPartnerDocumentsByUserId(profileUserId, docsForm);
        toast.success("Documents updated");
      } else {
        await createChannelPartnerDocuments(docsForm);
        toast.success("Documents uploaded");
      }
      await fetchDocs(profileUserId);
    } catch (e) {
      toast.error(e?.message || "Failed to save documents");
    } finally {
      setDocsSaving(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const profileRes = await getUserProfile();
        const profile = profileRes?.data || profileRes?.data?.data || {};
        const resolvedUserId =
          profile?.user_id ?? profile?.id ?? profileRes?.data?.user_id ?? profileRes?.data?.id ?? "";
        setProfileUserId(String(resolvedUserId || ""));

        const list = await getChannelPartners();
        const mapped = (Array.isArray(list) ? list : []).map((row) => ({
          id: row?.id,
          name: row?.name ?? "",
          email: row?.email ?? "",
          phone_no: row?.phone_no ?? "",
          minute: row?.minute ?? row?.minutes ?? 0,
          omni_minute: row?.omni_minute ?? row?.omniMinute ?? null,
        }));

        const filtered = mapped.filter((row) => {
          const rowEmail = String(row.email || "").trim().toLowerCase();
          const rowPhone = String(row.phone_no || "").trim();
          const rowName = String(row.name || "").trim().toLowerCase();
          return (
            (currentEmail && rowEmail === currentEmail) ||
            (currentPhone && rowPhone === currentPhone) ||
            (currentName && rowName === currentName)
          );
        });
        setProfileRow(filtered[0] || mapped[0] || null);
      } catch (e) {
        console.warn("profile load failed:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentEmail, currentName, currentPhone]);

  useEffect(() => {
    if (profileUserId) fetchDocs(profileUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUserId]);

  if (role !== "channelpartner") {
    return <div className="p-6 text-sm text-slate-700">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 sm:mb-6">
          <h2 className="text-[24px] font-bold tracking-tight text-gray-700 sm:text-3xl">
            Profile
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload your documents and manage bank details.
          </p>
        </div>

        <div className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Available remaining minutes :{" "}
          <span className="font-semibold">{loading ? "..." : availableMinutes}</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Channel Partner Documents</h3>
              <p className="mt-1 text-sm text-slate-500">
                Aadhar, PAN, GST and bank details.
              </p>
            </div>
            <button
              type="button"
              onClick={saveDocs}
              disabled={docsSaving || docsLoading}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {docsSaving ? "Saving..." : docsExists ? "Update" : "Save"}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Card Number</label>
              <input
                value={docsForm.aadhar_number}
                onChange={(e) => updateDocsForm("aadhar_number", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateDocsForm("aadhar_image", e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card Number</label>
              <input
                value={docsForm.pan_number}
                onChange={(e) => updateDocsForm("pan_number", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateDocsForm("pan_image", e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GST Certificate Number</label>
              <input
                value={docsForm.gst_number}
                onChange={(e) => updateDocsForm("gst_number", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GST Certificate Image</label>
              <input
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={(e) => updateDocsForm("gst_certificate_image", e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank AC No</label>
              <input
                value={docsForm.bank_account_number}
                onChange={(e) => updateDocsForm("bank_account_number", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank AC Name</label>
              <input
                value={docsForm.bank_account_name}
                onChange={(e) => updateDocsForm("bank_account_name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type of Account</label>
              <select
                value={docsForm.bank_account_type}
                onChange={(e) => updateDocsForm("bank_account_type", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
              >
                <option value="">Select</option>
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <input
                value={docsForm.bank_name}
                onChange={(e) => updateDocsForm("bank_name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC</label>
              <input
                value={docsForm.bank_ifsc}
                onChange={(e) => updateDocsForm("bank_ifsc", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Detail Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateDocsForm("bank_detail_image", e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

