"use client";

import { useState, useCallback } from "react";

const CONTENT_TYPES = [
  "Blog Post",
  "Product Launch",
  "Event Announcement",
  "Company Update",
  "Personal Brand",
  "Job Posting",
];

const VOICES = ["Professional", "Casual", "Bold", "Witty", "Inspirational"];

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter/X" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "email", label: "Email" },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

const PLATFORM_COLORS: Record<PlatformId, string> = {
  linkedin: "#0A66C2",
  twitter: "#000000",
  instagram: "#E1306C",
  tiktok: "#FF0050",
  facebook: "#1877F2",
  email: "#7C3AED",
};

const PLATFORM_LIMITS: Record<PlatformId, number> = {
  linkedin: 3000,
  twitter: 280,
  instagram: 2200,
  tiktok: 2200,
  facebook: 63206,
  email: 99999,
};

const PLATFORM_ICONS: Record<PlatformId, string> = {
  linkedin: "in",
  twitter: "X",
  instagram: "IG",
  tiktok: "TT",
  facebook: "f",
  email: "@",
};

interface CampaignResult {
  linkedin?: { post: string; hashtags: string };
  twitter?: { tweet: string; thread: string[]; hashtags: string };
  instagram?: { caption: string; hashtags: string };
  tiktok?: { hook: string; script: string; hashtags: string };
  facebook?: { post: string };
  email?: { subject: string; previewText: string; body: string };
}

function PlatformIcon({ platform }: { platform: PlatformId }) {
  const color = PLATFORM_COLORS[platform];
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {PLATFORM_ICONS[platform]}
    </span>
  );
}

function CharCount({ current, max }: { current: number; max: number }) {
  const pct = (current / max) * 100;
  const overLimit = current > max;
  return (
    <div className="flex items-center gap-2 text-xs mt-2">
      <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${overLimit ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={overLimit ? "text-red-400" : "text-zinc-400"}>
        {current.toLocaleString()}/{max.toLocaleString()}
      </span>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={copy}
      className="px-3 py-1.5 text-xs rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer"
    >
      {copied ? "Copied!" : label || "Copy"}
    </button>
  );
}

function PlatformCard({
  platform,
  data,
}: {
  platform: PlatformId;
  data: Record<string, unknown>;
}) {
  const [threadOpen, setThreadOpen] = useState(false);
  const color = PLATFORM_COLORS[platform];
  const label = PLATFORMS.find((p) => p.id === platform)?.label || platform;

  const mainContent = getMainContent(platform, data);
  const charCount = mainContent.length;
  const limit = PLATFORM_LIMITS[platform];

  return (
    <div
      className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col"
      style={{ borderColor: `${color}40` }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800"
        style={{ borderBottomColor: `${color}30` }}
      >
        <PlatformIcon platform={platform} />
        <span className="font-semibold text-sm">{label}</span>
        <div className="ml-auto">
          <CopyButton text={getAllPlatformText(platform, data)} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 space-y-3 text-sm text-zinc-300">
        {platform === "twitter" && (
          <>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Tweet
              </p>
              <p className="whitespace-pre-wrap">{data.tweet as string}</p>
            </div>
            {data.thread && (
              <div>
                <button
                  onClick={() => setThreadOpen(!threadOpen)}
                  className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {threadOpen ? "Hide" : "Show"} Thread (
                  {(data.thread as string[]).length} tweets)
                </button>
                {threadOpen && (
                  <div className="mt-2 space-y-2 pl-3 border-l-2 border-zinc-700">
                    {(data.thread as string[]).map(
                      (t: string, i: number) => (
                        <div key={i} className="text-zinc-400">
                          <span className="text-zinc-600 text-xs">
                            {i + 1}/{(data.thread as string[]).length}
                          </span>
                          <p className="whitespace-pre-wrap">{t}</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
            {data.hashtags && (
              <div>
                <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                  Hashtags
                </p>
                <p className="text-blue-400 text-xs">
                  {data.hashtags as string}
                </p>
              </div>
            )}
          </>
        )}

        {platform === "linkedin" && (
          <>
            <p className="whitespace-pre-wrap">{data.post as string}</p>
            {data.hashtags && (
              <p className="text-blue-400 text-xs">{data.hashtags as string}</p>
            )}
          </>
        )}

        {platform === "instagram" && (
          <>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Caption
              </p>
              <p className="whitespace-pre-wrap">{data.caption as string}</p>
            </div>
            {data.hashtags && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                    Hashtags
                  </p>
                  <p className="text-pink-400 text-xs break-all">
                    {data.hashtags as string}
                  </p>
                </div>
                <CopyButton text={data.hashtags as string} label="Copy Tags" />
              </div>
            )}
          </>
        )}

        {platform === "tiktok" && (
          <>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Hook (First 3 Seconds)
              </p>
              <p className="whitespace-pre-wrap font-semibold text-pink-300">
                {data.hook as string}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Script
              </p>
              <p className="whitespace-pre-wrap">{data.script as string}</p>
            </div>
            {data.hashtags && (
              <p className="text-pink-400 text-xs">
                {data.hashtags as string}
              </p>
            )}
          </>
        )}

        {platform === "facebook" && (
          <p className="whitespace-pre-wrap">{data.post as string}</p>
        )}

        {platform === "email" && (
          <>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Subject Line
              </p>
              <p className="font-semibold">{data.subject as string}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Preview Text
              </p>
              <p className="text-zinc-400 italic">
                {data.previewText as string}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
                Body
              </p>
              <p className="whitespace-pre-wrap">{data.body as string}</p>
            </div>
          </>
        )}
      </div>

      {/* Char count */}
      <div className="px-4 pb-3">
        <CharCount current={charCount} max={limit} />
      </div>
    </div>
  );
}

function getMainContent(
  platform: PlatformId,
  data: Record<string, unknown>
): string {
  switch (platform) {
    case "twitter":
      return (data.tweet as string) || "";
    case "linkedin":
      return (data.post as string) || "";
    case "instagram":
      return (data.caption as string) || "";
    case "tiktok":
      return `${data.hook || ""}\n${data.script || ""}`;
    case "facebook":
      return (data.post as string) || "";
    case "email":
      return `${data.subject || ""}\n${data.previewText || ""}\n${data.body || ""}`;
    default:
      return "";
  }
}

function getAllPlatformText(
  platform: PlatformId,
  data: Record<string, unknown>
): string {
  switch (platform) {
    case "twitter":
      return `${data.tweet || ""}\n\nThread:\n${((data.thread as string[]) || []).map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n${data.hashtags || ""}`;
    case "linkedin":
      return `${data.post || ""}\n\n${data.hashtags || ""}`;
    case "instagram":
      return `${data.caption || ""}\n\n${data.hashtags || ""}`;
    case "tiktok":
      return `Hook: ${data.hook || ""}\n\nScript:\n${data.script || ""}\n\n${data.hashtags || ""}`;
    case "facebook":
      return (data.post as string) || "";
    case "email":
      return `Subject: ${data.subject || ""}\nPreview: ${data.previewText || ""}\n\n${data.body || ""}`;
    default:
      return JSON.stringify(data);
  }
}

function formatAllAsMarkdown(result: CampaignResult): string {
  let md = "# Social Media Campaign\n\n";
  const entries = Object.entries(result) as [
    PlatformId,
    Record<string, unknown>,
  ][];
  for (const [platform, data] of entries) {
    const label = PLATFORMS.find((p) => p.id === platform)?.label || platform;
    md += `## ${label}\n\n${getAllPlatformText(platform, data)}\n\n---\n\n`;
  }
  return md;
}

function getTotalChars(result: CampaignResult): number {
  return Object.entries(result).reduce((sum, [platform, data]) => {
    return (
      sum +
      getMainContent(
        platform as PlatformId,
        data as Record<string, unknown>
      ).length
    );
  }, 0);
}

export default function Home() {
  const [contentType, setContentType] = useState("Blog Post");
  const [content, setContent] = useState("");
  const [voice, setVoice] = useState("Professional");
  const [audience, setAudience] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(
    PLATFORMS.map((p) => p.id)
  );
  const [result, setResult] = useState<CampaignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!content.trim()) {
      setError("Please paste some content first.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Select at least one platform.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.slice(0, 6000),
          contentType,
          voice,
          audience,
          platforms: selectedPlatforms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [allCopied, setAllCopied] = useState(false);
  const copyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(formatAllAsMarkdown(result));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const platformCount = result ? Object.keys(result).length : 0;
  const totalChars = result ? getTotalChars(result) : 0;

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <div>
            <h1 className="text-lg font-bold">Campaign Generator</h1>
            <p className="text-xs text-zinc-500">
              One content, six platforms, zero effort.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Input Section */}
        <section className="space-y-6 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Content Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  onClick={() => setContentType(ct)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    contentType === ct
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Source Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here... (blog post, press release, product description, announcement, etc.)"
              rows={6}
              maxLength={6000}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-y"
            />
            <p className="text-xs text-zinc-600 mt-1 text-right">
              {content.length}/6,000 characters
            </p>
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Brand Voice
            </label>
            <div className="flex flex-wrap gap-2">
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
                    voice === v
                      ? "bg-pink-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Target Audience{" "}
              <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., SaaS founders, Gen Z consumers, HR professionals..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>

          {/* Platform Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((p) => {
                const checked = selectedPlatforms.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all border ${
                      checked
                        ? "border-violet-500/50 bg-zinc-800 text-white"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlatform(p.id)}
                      className="sr-only"
                    />
                    <PlatformIcon platform={p.id} />
                    {p.label}
                    {checked && (
                      <span className="text-violet-400 text-xs ml-1">
                        &#10003;
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white text-lg bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 hover:from-violet-500 hover:via-pink-500 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-violet-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating Campaign...
              </span>
            ) : (
              "Generate Campaign"
            )}
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="space-y-6">
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-zinc-500">Total Characters</span>
                  <p className="text-lg font-bold text-white">
                    {totalChars.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Platforms</span>
                  <p className="text-lg font-bold text-white">
                    {platformCount}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Est. Reach Multiplier</span>
                  <p className="text-lg font-bold text-emerald-400">
                    {platformCount}x
                  </p>
                </div>
              </div>
              <button
                onClick={copyAll}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-medium hover:from-violet-500 hover:to-pink-500 transition-all cursor-pointer"
              >
                {allCopied ? "Copied All!" : "Copy All as Markdown"}
              </button>
            </div>

            {/* Platform Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(
                Object.entries(result) as [
                  PlatformId,
                  Record<string, unknown>,
                ][]
              ).map(([platform, data]) => (
                <PlatformCard key={platform} platform={platform} data={data} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        Campaign Generator &mdash; Powered by AI
      </footer>
    </div>
  );
}
