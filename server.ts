import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI client with required User-Agent header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Available block metadata catalog for AI semantic matching
const BLOCK_CATALOG = [
  {
    type: 'hero-split',
    name: 'Hero Split',
    desc: 'Hero header with headline, lead paragraph, CTA buttons, badge, and image/illustration showcase',
    category: 'headers',
    keywords: ['hero', 'header', 'headline', 'landing', 'intro', 'cta', 'split', 'welcome', 'banner', 'frontpage'],
  },
  {
    type: 'hero-centered',
    name: 'Hero Centered',
    desc: 'Hero header with bold centered headline, subheadline, and call-to-action buttons',
    category: 'headers',
    keywords: ['hero', 'centered', 'headline', 'impact', 'statement', 'big text', 'title', 'announcement'],
  },
  {
    type: 'features-3col',
    name: '3-Column Features',
    desc: '3-column feature highlight cards with icons, titles, and descriptions',
    category: 'features',
    keywords: ['features', 'highlights', 'benefits', 'grid', 'columns', 'services', 'capabilities', 'icons', 'cards', '3col'],
  },
  {
    type: 'features-split',
    name: 'Features Split',
    desc: '2-column split feature section with key bullet points and media showcase',
    category: 'features',
    keywords: ['features', 'split', 'bullets', 'showcase', 'side by side', 'product tour', 'explanation'],
  },
  {
    type: 'pricing-tiers',
    name: 'Pricing Tiers',
    desc: '3-tier pricing comparison table with feature checklists, popular badge, and purchase buttons',
    category: 'pricing',
    keywords: ['pricing', 'plans', 'tiers', 'cost', 'subscription', 'monthly', 'annual', 'packages', 'checkout', 'buy', 'pay'],
  },
  {
    type: 'testimonials-cards',
    name: 'Testimonials Cards',
    desc: 'Customer social proof with testimonials, client avatars, ratings, and quotes',
    category: 'testimonials',
    keywords: ['testimonials', 'reviews', 'social proof', 'quotes', 'ratings', 'stars', 'customers', 'feedback', 'clients'],
  },
  {
    type: 'contact-split',
    name: 'Contact & Lead Form',
    desc: 'Contact inquiry section with form inputs (name, email, message) and company contact details',
    category: 'forms',
    keywords: ['contact', 'form', 'leads', 'inquiry', 'message', 'email', 'get in touch', 'reach out', 'support', 'inputs'],
  },
  {
    type: 'media-carousel',
    name: 'Media Carousel Slider',
    desc: 'Interactive video, audio, and image carousel slider with caption overlays',
    category: 'gallery',
    keywords: ['carousel', 'slider', 'slideshow', 'video', 'media', 'interactive', 'player', 'presentation'],
  },
  {
    type: 'gallery-grid',
    name: 'Gallery Grid',
    desc: 'Responsive multi-column photo/portfolio gallery grid with showcase cards',
    category: 'gallery',
    keywords: ['gallery', 'portfolio', 'photos', 'images', 'grid', 'work', 'projects', 'art', 'photography'],
  },
  {
    type: 'accordion-faq',
    name: 'Accordion FAQ',
    desc: 'Frequently Asked Questions with collapsible Bootstrap accordion panels',
    category: 'content',
    keywords: ['faq', 'questions', 'accordion', 'answers', 'collapsible', 'help', 'q&a', 'troubleshooting'],
  },
  {
    type: 'team-cards',
    name: 'Team Members',
    desc: 'Team member showcase with photos, job titles, bios, and social links',
    category: 'team',
    keywords: ['team', 'staff', 'people', 'members', 'leadership', 'about us', 'founders', 'employees'],
  },
  {
    type: 'custom-html',
    name: 'Custom HTML/CSS Block',
    desc: 'Custom HTML & CSS sandbox block for bespoke components, scripts, or embeds',
    category: 'html',
    keywords: ['custom html', 'code', 'css', 'script', 'embed', 'iframe', 'raw html', 'custom element'],
  },
  {
    type: 'blank-container',
    name: 'Blank Container',
    desc: 'Clean responsive Bootstrap 5 container row with customizable spacing',
    category: 'content',
    keywords: ['blank', 'empty', 'container', 'row', 'spacer', 'clean slate', 'wrapper', 'box'],
  },
  {
    type: 'navbar-standard',
    name: 'Standard Navbar',
    desc: 'Navigation bar with brand logo, nav links, and CTA button',
    category: 'navbars',
    keywords: ['navbar', 'navigation', 'menu', 'header bar', 'nav', 'links', 'logo'],
  },
  {
    type: 'footer-columns',
    name: 'Multi-Column Footer',
    desc: 'Multi-column footer with brand info, quick links, and newsletter signup',
    category: 'footers',
    keywords: ['footer', 'bottom', 'copyright', 'newsletter', 'links', 'site footer'],
  },
];

function fallbackSemanticSearch(queryStr: string, limit: number) {
  const q = queryStr.toLowerCase().trim();
  const tokens = q.split(/[\s,.-]+/).filter((t) => t.length > 2);

  const scored = BLOCK_CATALOG.map((block) => {
    let score = 50;
    const nameLower = block.name.toLowerCase();
    const descLower = block.desc.toLowerCase();

    // Exact phrase match
    if (nameLower.includes(q)) score += 40;
    if (descLower.includes(q)) score += 30;

    // Token match
    tokens.forEach((token) => {
      if (block.keywords.some((k) => k.includes(token) || token.includes(k))) {
        score += 20;
      }
      if (nameLower.includes(token)) score += 15;
      if (descLower.includes(token)) score += 10;
    });

    let relevanceReason = `Matches "${block.category}" layout matching your query.`;
    if (nameLower.includes('pricing') || q.includes('price') || q.includes('cost') || q.includes('plan')) {
      relevanceReason = 'Ideal for presenting subscription plans, tiers, and checkout options.';
    } else if (nameLower.includes('testimonial') || q.includes('review') || q.includes('proof') || q.includes('star')) {
      relevanceReason = 'Provides customer testimonials and ratings to maximize social proof.';
    } else if (nameLower.includes('hero') || q.includes('welcome') || q.includes('headline')) {
      relevanceReason = 'Captures visitor attention immediately with high-impact headlines and CTAs.';
    } else if (nameLower.includes('feature') || q.includes('benefit') || q.includes('service')) {
      relevanceReason = 'Highlights key product features and service benefits in a structured grid.';
    } else if (nameLower.includes('contact') || q.includes('form') || q.includes('message')) {
      relevanceReason = 'Includes ready-to-use input fields to capture user inquiries and leads.';
    } else if (nameLower.includes('carousel') || q.includes('slider') || q.includes('slide')) {
      relevanceReason = 'Presents dynamic media and video slides with interactive pagination.';
    }

    // Capitalize query words for title suggestion
    const cleanWords = q.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).slice(0, 4);
    const suggestedTitle = cleanWords.length > 0
      ? cleanWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : block.name;

    return {
      blockType: block.type,
      name: block.name,
      matchScore: Math.min(score, 98),
      relevanceReason,
      suggestedTitle: `${suggestedTitle} · ${block.name}`,
      suggestedSubtitle: block.desc,
      badge: score > 75 ? 'Top AI Match' : 'Recommended',
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

// AI Natural Language Search endpoint for CommandPalette
app.post('/api/ai/search-blocks', async (req, res) => {
  const { query, limit = 5 } = req.body || {};

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'A natural language query is required' });
  }

  const cleanQuery = query.trim();

  // If Gemini API is configured, use gemini-3.8-flash for intelligent semantic matching
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an AI assistant for a visual Bootstrap 5 website builder.
A user entered this natural language search in the Command Palette:
"${cleanQuery}"

Analyze the user's intent, layout needs, and specific component requests.
Map the query to the best matching block types from this supported catalog:
${BLOCK_CATALOG.map((b) => `- ${b.type}: ${b.name} (${b.desc})`).join('\n')}

Return up to ${limit} ranked matches with:
1. blockType: exact matching type string
2. matchScore: integer between 65 and 99
3. relevanceReason: a concise, clear 1-sentence explanation of why this block solves their request
4. suggestedTitle: an engaging, natural headline tailored specifically to the user query
5. suggestedSubtitle: a supportive 1-line subtitle or description tailored to the user query
6. badge: a short badge label like "Best Match", "AI Recommended", "High Conversion", or "Suggested"`,
        config: {
          systemInstruction:
            'You are an expert AI component recommendation engine for a Bootstrap 5 visual website builder. Return strict JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    blockType: { type: Type.STRING },
                    matchScore: { type: Type.INTEGER },
                    relevanceReason: { type: Type.STRING },
                    suggestedTitle: { type: Type.STRING },
                    suggestedSubtitle: { type: Type.STRING },
                    badge: { type: Type.STRING },
                  },
                  required: ['blockType', 'matchScore', 'relevanceReason', 'suggestedTitle'],
                },
              },
            },
            required: ['matches'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{"matches": []}');
      if (Array.isArray(parsed.matches) && parsed.matches.length > 0) {
        // Enrich matches with block catalog names and icons
        const enriched = parsed.matches.map((m: any) => {
          const found = BLOCK_CATALOG.find((b) => b.type === m.blockType);
          return {
            ...m,
            name: found?.name || m.blockType,
            category: found?.category || 'content',
          };
        });

        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          query: cleanQuery,
          matches: enriched,
        });
      }
    } catch (err: any) {
      console.warn('Gemini AI Search error, using semantic fallback:', err?.message || err);
    }
  }

  // Fallback semantic search
  const fallbackResults = fallbackSemanticSearch(cleanQuery, limit);
  return res.json({
    success: true,
    source: 'semantic-engine',
    query: cleanQuery,
    matches: fallbackResults,
  });
});

async function startServer() {
  // In development, attach Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static dist assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
