"use client";

import { useEffect, useState } from "react";
import { convertBlueprintToDroppleTemplate } from "@/lib/convertBlueprintToDroppleTemplate";
import { useTemplateBuilderStore } from "@/store/useTemplateBuilderStore";
import { generateTemplateThumbnail } from "@/lib/templates/exportTemplate";
import { templateStyles, templateStyleMap } from "@/lib/templateStyles";
import { templateComponentPresets } from "@/lib/templateComponents";
import { applyMotionThemeToLayers } from "@/lib/applyMotionTheme";
import { motionThemeMap } from "@/lib/motionThemes";
import { buildBrandKit } from "@/lib/buildBrandKit";
import { validateDroppleTemplate } from "@/lib/droppleTemplateSpec";

export default function TemplateAIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [styleId, setStyleId] = useState(templateStyles?.[0]?.id || "");
  const [componentId, setComponentId] = useState(templateComponentPresets?.[0]?.id || "");
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState(null);
  const [assembly, setAssembly] = useState(true);
  const [brandKit, setBrandKit] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [brandPersonality, setBrandPersonality] = useState("");
  const [brandPrimary, setBrandPrimary] = useState("");
  const [brandSecondary, setBrandSecondary] = useState("");
  const [icons, setIcons] = useState([]);
  const [brandIcon, setBrandIcon] = useState("");
  const [savedBrandkits, setSavedBrandkits] = useState([]);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [imageSource, setImageSource] = useState("pack"); // pack | asset | brand | upload | stock
  const [assetImages, setAssetImages] = useState([]);
  const [allowStock, setAllowStock] = useState(false);
  const [useAIImage, setUseAIImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("AI_BRAND_KIT");
      if (stored) {
        const parsed = JSON.parse(stored);
        setBrandKit(parsed);
        setBrandName(parsed.name || "");
        setBrandTagline(parsed.tagline || "");
        setBrandPersonality(
          Array.isArray(parsed.personality) ? parsed.personality.join(", ") : "",
        );
        setBrandPrimary(parsed.theme?.tokens?.colors?.primary || "");
        setBrandSecondary(parsed.theme?.tokens?.colors?.secondary || "");
        setBrandIcon(parsed.icon || parsed.iconUrl || "");
      }
    } catch (err) {
      console.warn("Failed to load stored brand kit", err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/asset-library/all?type=icon");
        if (!res.ok) return;
        const data = await res.json();
        setIcons(data.slice(0, 25));
      } catch (err) {
        console.warn("Failed to load icons", err);
      }

      try {
        const resImages = await fetch("/api/asset-library/all?type=image");
        if (resImages.ok) {
          const data = await resImages.json();
          setAssetImages(data);
        }
      } catch (err) {
        console.warn("Failed to load images", err);
      }

      try {
        const resKits = await fetch("/api/brandkits/all");
        if (resKits.ok) {
          const data = await resKits.json();
          setSavedBrandkits(data.brandkits || []);
        }
      } catch (err) {
        console.warn("Failed to load brand kits", err);
      }
    })();
  }, []);
  const buildThemeFromStyle = (style) => {
    if (!style) return null;
    return {
      _id: `style-${style.id}`,
      name: style.label,
      tokens: {
        colors: {
          primary: style.palette.primary,
          secondary: style.palette.accent || style.palette.primary,
          surface: style.palette.surface || style.palette.background,
          background: style.palette.background,
          text: style.palette.text,
          muted: style.palette.muted || style.palette.text,
        },
      },
      radius: style.radius,
      shadow: style.shadow,
    };
  };

  const applyTemplateToCanvas = (tpl) => {
    if (!tpl) return;
    const page = {
      id: "page_1",
      name: tpl.name || "Generated Page",
      artboards: [],
      layers: tpl.layers || [],
    };
    const prev = useTemplateBuilderStore.getState().currentTemplate || {};
    const state = useTemplateBuilderStore.getState();
    const style = tpl.styleId ? templateStyleMap[tpl.styleId] : null;
    const styleTheme = buildThemeFromStyle(style);
    const motionTheme = style?.motionTheme ? motionThemeMap[style.motionTheme] : null;
    const themedLayers = motionTheme ? applyMotionThemeToLayers(page.layers || [], motionTheme, null) : page.layers || [];
    const themes = state.themes || [];

    const brandTheme =
      tpl?.brand?.theme ||
      (brandKit?.theme ? { ...brandKit.theme, _id: brandKit.theme._id || brandKit.theme.id } : null);

    const withStyle =
      styleTheme && styleTheme._id
        ? (() => {
            const existing = themes.find((t) => t._id === styleTheme._id);
            if (existing) {
              return themes.map((t) => (t._id === styleTheme._id ? { ...existing, ...styleTheme } : t));
            }
            return [...themes, styleTheme];
          })()
        : themes;

    const withBrand =
      brandTheme && brandTheme._id
        ? (() => {
            const existing = withStyle.find((t) => t._id === brandTheme._id);
            if (existing) {
              return withStyle.map((t) => (t._id === brandTheme._id ? { ...existing, ...brandTheme } : t));
            }
            return [...withStyle, brandTheme];
          })()
        : withStyle;

    const nextActiveThemeId = brandTheme?._id || styleTheme?._id || state.activeThemeId;

    useTemplateBuilderStore.setState({
      currentTemplate: {
        ...prev,
        id: tpl.id || crypto.randomUUID(),
        name: tpl.name || "AI Template",
        description: tpl.description || "",
        mode: tpl.mode || "uiux",
        width: tpl.width || prev.width || 1440,
        height: tpl.height || prev.height || 1024,
        layers: themedLayers,
        tags: tpl.tags || [],
        thumbnail: tpl.thumbnail || "",
        styleId: tpl.styleId,
        componentId: tpl.componentId,
        motionThemeId: style?.motionTheme || tpl.motionThemeId,
        brand: tpl.brand || brandKit,
      },
      pages: [{ ...page, layers: themedLayers }],
      activePageId: page.id,
      themes: withBrand,
      activeThemeId: nextActiveThemeId,
    });
  };

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let resolvedImageUrl = heroImageUrl;
      if (imageSource === "brand" && brandKit?.logos?.length) {
        resolvedImageUrl = brandKit.logos[0];
      }
      if (imageSource === "asset" && !resolvedImageUrl && assetImages.length) {
        resolvedImageUrl = assetImages[0]?.fileUrl || assetImages[0]?.url;
      }
      if (imageSource === "stock" && allowStock && !resolvedImageUrl) {
        const query = encodeURIComponent(prompt || styleId || "design");
        resolvedImageUrl = `https://source.unsplash.com/1600x900/?${query}`;
        // cache into asset library
        try {
          await fetch("/api/asset-library/create", {
            method: "POST",
            body: JSON.stringify({
              type: "image",
              title: `Stock: ${prompt?.slice(0, 40) || query}`,
              description: "",
              tags: ["stock"],
              fileUrl: resolvedImageUrl,
              previewUrl: resolvedImageUrl,
              fileType: "image/jpeg",
              size: 0,
              width: 1600,
              height: 900,
              isPremium: false,
              price: 0,
            }),
          });
        } catch (err) {
          console.warn("Failed to cache stock image", err);
        }
      }

      if (imageSource === "ai" && useAIImage && !resolvedImageUrl) {
        setIsGeneratingImage(true);
        try {
          const resAI = await fetch("/api/asset-ai", {
            method: "POST",
            body: JSON.stringify({
              prompt: prompt || "high-quality cinematic photo",
              style: styleId,
            }),
          });
          const dataAI = await resAI.json();
          if (resAI.ok && dataAI?.url) {
            resolvedImageUrl = dataAI.url;
            // cache into asset library
            await fetch("/api/asset-library/create", {
              method: "POST",
              body: JSON.stringify({
                type: "image",
                title: `AI: ${prompt?.slice(0, 40) || "generated"}`,
                description: "",
                tags: ["ai"],
                fileUrl: resolvedImageUrl,
                previewUrl: resolvedImageUrl,
                fileType: "image/jpeg",
                size: 0,
                width: 1600,
                height: 900,
                isPremium: false,
                price: 0,
              }),
            });
          }
        } catch (err) {
          console.warn("AI image generation failed", err);
        } finally {
          setIsGeneratingImage(false);
        }
      }

      const res = await fetch("/api/template-ai", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          styleId,
          componentId,
          assembly,
          brand: brandKit,
          imageUrl: resolvedImageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed");
      }
      const tpl = convertBlueprintToDroppleTemplate(data.blueprint || {});
      const styledTpl = {
        ...tpl,
        styleId: styleId || tpl.styleId,
        componentId: componentId || tpl.componentId,
        tags: Array.from(new Set([...(tpl.tags || []), styleId, componentId].filter(Boolean))),
        brand: brandKit || tpl.brand,
        images:
          tpl.images && tpl.images.length
            ? tpl.images
            : resolvedImageUrl
              ? [{ id: "img1", url: resolvedImageUrl }]
              : tpl.images,
      };
      const validation = validateDroppleTemplate(styledTpl);
      if (!validation.valid) {
        throw new Error(`Template validation failed: ${validation.errors?.[0] || "invalid template"}`);
      }
      setTemplate(styledTpl);
      applyTemplateToCanvas(styledTpl);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addToEditor() {
    if (!template) return;
    localStorage.setItem("AI_TEMPLATE", JSON.stringify(template));
    window.location.href = "/editor/templates/create";
  }

  async function saveToMarketplace() {
    if (!template) return;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const thumbBlob = await generateTemplateThumbnail(template);
      const form = new FormData();
      form.append(
        "metadata",
        JSON.stringify({
          name: template.name || "AI Template",
          category: template.category || "AI Generated",
          tags: template.tags || ["ai-generated"],
          visibility: "public",
        }),
      );
      form.append("template", new Blob([JSON.stringify(template)], { type: "application/json" }), `${template.id || "ai-template"}.json`);
      if (thumbBlob) form.append("thumbnail", thumbBlob, `${template.id || "ai-template"}.png`);
      const res = await fetch("/api/templates/save", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) throw new Error("Sign in to publish to the marketplace.");
        throw new Error(data?.error || "Save failed");
      }
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err?.message || "Save failed");
    }
  }

  return (
    <div className="p-3 border rounded space-y-3 bg-white shadow-sm">
      <div>
        <h3 className="font-semibold text-base">AI Template Generator</h3>
        <p className="text-xs text-gray-500">Describe a screen. We’ll build the layout.</p>
      </div>

      <textarea
        className="w-full border rounded p-2 text-sm h-24"
        placeholder="Generate a modern SaaS dashboard with sidebar, charts, and top navbar..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Style preset</label>
        <select
          className="w-full border rounded p-2 text-sm bg-white"
          value={styleId}
          onChange={(e) => setStyleId(e.target.value)}
        >
          {templateStyles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-500 leading-snug">
          Applies palette, fonts, gradients, and motion vibe to the generated template.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Layout preset</label>
        <select
          className="w-full border rounded p-2 text-sm bg-white"
          value={componentId}
          onChange={(e) => setComponentId(e.target.value)}
        >
          {templateComponentPresets.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-500 leading-snug">
          Guides the AI to include the right blocks (hero image, badge, CTA, icon, etc.) and motion.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Hero image source</label>
        <select
          className="w-full border rounded p-2 text-sm bg-white"
          value={imageSource}
          onChange={(e) => setImageSource(e.target.value)}
        >
          <option value="pack">Pack (default)</option>
          <option value="asset">Asset Library</option>
          <option value="brand">Brand logo/photo</option>
          <option value="upload">Upload</option>
          <option value="stock">Stock (Unsplash/Pexels)</option>
          <option value="ai">AI (off by default)</option>
        </select>
        {imageSource === "asset" ? (
          <select
            className="w-full border rounded p-2 text-sm bg-white"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
          >
            <option value="">Select asset</option>
            {assetImages.map((img) => (
              <option key={img._id || img.id || img.fileUrl} value={img.fileUrl || img.url}>
                {img.title || img.name || img.fileUrl || "image"}
              </option>
            ))}
          </select>
        ) : null}
        {imageSource === "brand" ? (
          <button
            type="button"
            className="w-full border rounded p-2 text-sm bg-white hover:bg-gray-50"
            onClick={() => {
              if (brandKit?.logos?.length) setHeroImageUrl(brandKit.logos[0]);
            }}
          >
            Use brand logo/photo
          </button>
        ) : null}
        {imageSource === "upload" ? (
          <input
            type="file"
            accept="image/*"
            className="w-full text-xs"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.append("file", file);
              try {
                const res = await fetch("/api/assets/upload", { method: "POST", body: form });
                const data = await res.json();
                if (res.ok && (data.url || data.fileUrl)) {
                  const url = data.url || data.fileUrl;
                  setHeroImageUrl(url);
                  setAssetImages((prev) => [{ ...(data || {}), fileUrl: url }, ...prev]);
                }
              } catch (err) {
                console.warn("Upload failed", err);
              }
            }}
          />
        ) : null}
        {imageSource === "stock" ? (
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={allowStock}
              onChange={(e) => setAllowStock(e.target.checked)}
            />
            <span>Allow Unsplash/Pexels fallback</span>
          </label>
        ) : null}
        {imageSource === "ai" ? (
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={useAIImage}
              onChange={(e) => setUseAIImage(e.target.checked)}
            />
            <span>Generate AI image (stores to library)</span>
          </label>
        ) : null}
        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Paste image URL or leave blank to use pack"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
        />
        <p className="text-[11px] text-gray-500 leading-snug">
          Choose a source or paste a URL. If empty, a style-specific pack image is used.
        </p>
      </div>

      <label className="flex items-center space-x-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={assembly}
          onChange={(e) => setAssembly(e.target.checked)}
          className="h-4 w-4"
        />
        <span>Use deterministic assembly (local layout + motion, AI only for content)</span>
      </label>

      <div className="space-y-2 border-t pt-3">
        <p className="text-xs font-semibold text-gray-700">Brand (optional)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border rounded p-2 text-sm col-span-2"
            placeholder="Brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <input
            className="border rounded p-2 text-sm col-span-2"
            placeholder="Tagline"
            value={brandTagline}
            onChange={(e) => setBrandTagline(e.target.value)}
          />
          <input
            className="border rounded p-2 text-sm"
            placeholder="Personality (comma-separated)"
            value={brandPersonality}
            onChange={(e) => setBrandPersonality(e.target.value)}
          />
          <input
            className="border rounded p-2 text-sm"
            placeholder="Primary color (#hex)"
            value={brandPrimary}
            onChange={(e) => setBrandPrimary(e.target.value)}
          />
          <input
            className="border rounded p-2 text-sm"
            placeholder="Secondary color (#hex)"
            value={brandSecondary}
            onChange={(e) => setBrandSecondary(e.target.value)}
          />
          <select
            className="border rounded p-2 text-sm col-span-2 bg-white"
            value={brandIcon}
            onChange={(e) => setBrandIcon(e.target.value)}
          >
            <option value="">Select icon (optional)</option>
            {icons.map((icon) => (
              <option key={icon._id || icon.id || icon.fileUrl} value={icon.fileUrl || icon.url}>
                {icon.title || icon.name || icon.fileUrl}
              </option>
            ))}
          </select>

          {savedBrandkits.length ? (
            <select
              className="border rounded p-2 text-sm col-span-2 bg-white"
              onChange={(e) => {
                const id = e.target.value;
                const kit = savedBrandkits.find((k) => (k._id || k.id) === id);
                if (!kit) return;
                setBrandKit(kit);
                setBrandName(kit.name || "");
                setBrandTagline(kit.tagline || "");
                setBrandPersonality(Array.isArray(kit.personality) ? kit.personality.join(", ") : "");
                setBrandPrimary(kit.theme?.tokens?.colors?.primary || "");
                setBrandSecondary(kit.theme?.tokens?.colors?.secondary || "");
                setBrandIcon(kit.icon || kit.iconUrl || "");
              }}
            >
              <option value="">Load saved brand kit</option>
              {savedBrandkits.map((kit) => (
                <option key={kit._id || kit.id} value={kit._id || kit.id}>
                  {kit.name || kit._id || kit.id}
                </option>
              ))}
            </select>
          ) : null}
          <select
            className="border rounded p-2 text-sm col-span-2 bg-white"
            value={brandIcon}
            onChange={(e) => setBrandIcon(e.target.value)}
          >
            <option value="">Select icon (optional)</option>
            {icons.map((icon) => (
              <option key={icon._id || icon.id || icon.fileUrl} value={icon.fileUrl || icon.url}>
                {icon.title || icon.name || icon.fileUrl}
              </option>
            ))}
          </select>
          <button
            className="col-span-2 bg-gray-100 text-gray-800 rounded p-2 text-sm hover:bg-gray-200"
            type="button"
          onClick={() => {
            const colors = {
              primary: brandPrimary ? [brandPrimary] : [],
              secondary: brandSecondary ? [brandSecondary] : [],
              neutral: [],
              semantic: {},
            };
            const blueprint = {
              name: brandName || "Brand",
              tagline: brandTagline || "",
              brandPersonality: brandPersonality
                ? brandPersonality.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
              colorPalette: colors,
            };
            const kit = buildBrandKit(blueprint, brandIcon ? [brandIcon] : [], []);
            if (brandIcon) {
              kit.icon = brandIcon;
              kit.iconUrl = brandIcon;
            }
            setBrandKit(kit);
            try {
              localStorage.setItem("AI_BRAND_KIT", JSON.stringify(kit));
            } catch (err) {
              console.warn("Failed to store brand kit", err);
            }
          }}
        >
          Save brand for generation
        </button>
          {brandKit ? (
            <p className="text-[11px] text-emerald-600 col-span-2">
              Brand applied: {brandKit.name || "Brand"} (primary {brandKit.theme?.tokens?.colors?.primary || "n/a"})
              {brandKit.icon ? ` • icon set` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        className="w-full bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700 disabled:bg-gray-300"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? "Generating…" : "Generate Template"}
      </button>

      {template && (
        <div className="space-y-2">
          <button
            className="w-full border border-blue-200 text-blue-700 rounded p-2 text-sm hover:bg-blue-50"
            onClick={addToEditor}
          >
            Add to Editor
          </button>
          <button
            className="w-full bg-emerald-600 text-white rounded p-2 text-sm hover:bg-emerald-700 disabled:opacity-60"
            onClick={saveToMarketplace}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving"
              ? "Saving to Marketplace…"
              : saveStatus === "saved"
                ? "Saved to Marketplace"
                : "Save to Marketplace"}
          </button>
          {saveError ? <p className="text-xs text-red-600">{saveError}</p> : null}
          {saveStatus === "saved" && !saveError ? (
            <p className="text-xs text-emerald-600">Published (requires sign-in).</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
      try {
        const resImages = await fetch("/api/asset-library/all?type=image");
        if (resImages.ok) {
          const data = await resImages.json();
          setAssetImages(data);
        }
      } catch (err) {
        console.warn("Failed to load images", err);
      }
