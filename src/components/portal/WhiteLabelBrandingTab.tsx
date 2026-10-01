import React, { useState } from 'react';
import {
  Palette,
  Globe,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Image,
  Sparkles,
  ExternalLink,
  Check,
  RefreshCw,
  Layout,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AgencyBranding } from '../../types';

export const WhiteLabelBrandingTab: React.FC = () => {
  const { agencyBranding, updateAgencyBranding } = useAuth();

  const [formData, setFormData] = useState<AgencyBranding>({ ...agencyBranding });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<'verified' | 'checking'>('verified');

  const COLOR_PRESETS = [
    { name: 'Indigo Pulse', hex: '#6366f1' },
    { name: 'Electric Blue', hex: '#2563eb' },
    { name: 'Emerald Mint', hex: '#059669' },
    { name: 'Imperial Violet', hex: '#7c3aed' },
    { name: 'Ruby Crimson', hex: '#e11d48' },
    { name: 'Amber Sunset', hex: '#d97706' },
    { name: 'Slate Onyx', hex: '#0f172a' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateAgencyBranding(formData);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleVerifyDns = () => {
    setDnsStatus('checking');
    setTimeout(() => setDnsStatus('verified'), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              White-Label Engine
            </span>
            <span className="text-xs text-slate-400">
              Replace all platform references with your agency brand
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Agency Identity & Custom Domain
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure how clients perceive your software. Customize the portal name, logo, custom domain, and color palette.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3.5 py-2 rounded-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Branding saved successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* Agency Name & Logo */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Agency Brand & Identity</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Agency or Business Name
              </label>
              <input
                type="text"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                placeholder="e.g. Acme Digital Agency"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Shown in the top header, client login page, and invoice receipts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Agency Logo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.agencyLogoUrl}
                onChange={(e) => setFormData({ ...formData, agencyLogoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Transparent PNG or SVG recommended (approx. 200x50px). If blank, an elegant agency monogram is rendered.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Support & Inquiries Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  placeholder="support@youragency.com"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Custom Domain & CNAME Verification */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Custom White-Label Domain</span>
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  dnsStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {dnsStatus === 'verified' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> SSL Active & Connected
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Verifying DNS...
                  </>
                )}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Client Portal Subdomain or CNAME
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  placeholder="portal.youragency.com"
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyDns}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition shrink-0"
                >
                  Verify DNS
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Point your CNAME record to <code className="text-indigo-400">cname.cloudboyx.io</code> to activate instant auto-renewing SSL certificates.
              </p>
            </div>
          </div>

          {/* Primary Brand Color */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Primary Brand Accent Color</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, primaryBrandColor: preset.hex })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    formData.primaryBrandColor.toLowerCase() === preset.hex.toLowerCase()
                      ? 'border-white bg-slate-800 text-white ring-2 ring-indigo-500/50'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div
                className="w-9 h-9 rounded-xl border border-slate-700 shadow-sm shrink-0"
                style={{ backgroundColor: formData.primaryBrandColor }}
              />
              <input
                type="text"
                value={formData.primaryBrandColor}
                onChange={(e) => setFormData({ ...formData, primaryBrandColor: e.target.value })}
                className="w-32 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                placeholder="#6366f1"
              />
              <span className="text-xs text-slate-500">Custom Hex Code</span>
            </div>
          </div>

          {/* Welcome Message & Platform Branding Toggle */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Client Portal Welcome Banner Copy
              </label>
              <textarea
                rows={3}
                value={formData.clientWelcomeMessage}
                onChange={(e) => setFormData({ ...formData, clientWelcomeMessage: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">
                  Hide All "Powered by" Badges
                </span>
                <span className="text-[11px] text-slate-400">
                  Fully unbranded white-label experience for your clients.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    hidePlatformBranding: !formData.hidePlatformBranding,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formData.hidePlatformBranding ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    formData.hidePlatformBranding ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save White-Label Branding</span>
            </button>
          </div>
        </form>

        {/* Live Client Preview Simulation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Client Portal Mockup
              </span>
              <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono">
                Interactive Preview
              </span>
            </div>

            {/* Mock Client Window */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              {/* Window Header / URL bar */}
              <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 bg-slate-900 text-slate-400 text-[10px] font-mono py-0.5 px-2 rounded text-center truncate">
                  https://{formData.customDomain || 'client.youragency.com'}/portal
                </div>
              </div>

              {/* Portal Header Preview */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  {formData.agencyLogoUrl ? (
                    <img
                      src={formData.agencyLogoUrl}
                      alt="Logo"
                      className="h-6 max-w-[100px] object-contain"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: formData.primaryBrandColor }}
                    >
                      {formData.agencyName.charAt(0) || 'A'}
                    </div>
                  )}
                  <span className="font-bold text-xs text-white tracking-tight">
                    {formData.agencyName || 'Agency Name'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: formData.primaryBrandColor }}
                  >
                    Client Dashboard
                  </span>
                </div>
              </div>

              {/* Portal Welcome Banner Preview */}
              <div className="p-4 space-y-3">
                <div
                  className="p-3.5 rounded-xl text-white text-xs border border-white/10 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${formData.primaryBrandColor}33 0%, #0f172a 100%)`,
                  }}
                >
                  <p className="font-bold text-sm mb-0.5">{formData.agencyName}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {formData.clientWelcomeMessage}
                  </p>
                </div>

                {/* Mock Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Website Status:</span>
                    <span className="text-emerald-400 font-semibold">🟢 Active Production</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Support Desk:</span>
                    <span className="text-slate-200 font-mono text-[10px]">
                      {formData.supportEmail || 'support@agency.com'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-full py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition"
                    style={{ backgroundColor: formData.primaryBrandColor }}
                  >
                    Request Design Revision
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 text-center">
              Clients access this portal using their assigned login credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
