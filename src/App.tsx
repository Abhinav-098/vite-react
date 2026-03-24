import { useState, useRef } from "react";

const tools = [
  { id: 1, icon: "📄", name: "Resume Analyzer", cat: "Analysis", desc: "Upload a resume + job description. Get match score, gaps & suggestions.", inputs: [{ key: "resume", label: "Resume Text", type: "textarea", placeholder: "Paste your resume here..." }, { key: "job", label: "Job Description", type: "textarea", placeholder: "Paste the job description here..." }], prompt: (v) => `Analyze this resume against the job description. Give a match score out of 100, key gaps, strengths, and 5 specific improvement suggestions. Format with clear sections.\n\nRESUME:\n${v.resume}\n\nJOB DESCRIPTION:\n${v.job}` },
  { id: 2, icon: "🗒️", name: "Meeting Summarizer", cat: "Writing", desc: "Paste a transcript. Get a summary, action items, decisions & owners.", inputs: [{ key: "transcript", label: "Meeting Transcript", type: "textarea", placeholder: "Paste your meeting transcript here..." }], prompt: (v) => `Summarize this meeting transcript. Include: 1) Key discussion points, 2) Decisions made, 3) Action items with owners (if mentioned), 4) Follow-ups needed.\n\nTRANSCRIPT:\n${v.transcript}` },
  { id: 3, icon: "✉️", name: "Cold Email Generator", cat: "Writing", desc: "Input a target company & role. Get personalized outreach emails.", inputs: [{ key: "company", label: "Target Company", type: "text", placeholder: "e.g. Stripe" }, { key: "role", label: "Role / Purpose", type: "text", placeholder: "e.g. Software Engineer" }, { key: "about", label: "About You (brief)", type: "textarea", placeholder: "Who are you and why are you reaching out?" }], prompt: (v) => `Write 3 cold email variants (formal, casual, bold) to ${v.company} for ${v.role}. Context: ${v.about}. Each email should have a subject line and be under 150 words.` },
  { id: 4, icon: "🗄️", name: "SQL Query Builder", cat: "Dev", desc: "Describe what data you want. Get a ready-to-run SQL query.", inputs: [{ key: "schema", label: "Table/Schema Info (optional)", type: "textarea", placeholder: "e.g. users(id, name, email), orders(id, user_id, amount)" }, { key: "request", label: "What data do you want?", type: "textarea", placeholder: "e.g. Top 10 users by total order amount this month" }], prompt: (v) => `Generate a SQL query for this request. Include the query and a brief explanation.\n\nSchema: ${v.schema || "Not provided"}\n\nRequest: ${v.request}` },
  { id: 5, icon: "📋", name: "Contract Red-Flagger", cat: "Analysis", desc: "Paste a contract. Get plain-English breakdown of risky clauses.", inputs: [{ key: "contract", label: "Contract Text", type: "textarea", placeholder: "Paste contract text here..." }], prompt: (v) => `Review this contract and identify: 1) Red flags, 2) Missing protections, 3) Unusual terms, 4) Plain-English explanation.\n\nCONTRACT:\n${v.contract}` },
  { id: 6, icon: "🃏", name: "Flashcard Factory", cat: "Writing", desc: "Paste study material. Get a quiz-ready flashcard deck.", inputs: [{ key: "material", label: "Study Material", type: "textarea", placeholder: "Paste your notes or textbook excerpt..." }, { key: "count", label: "Number of Cards", type: "text", placeholder: "e.g. 10" }], prompt: (v) => `Create ${v.count || 10} flashcards from this material. Format each as:\nQ: [question]\nA: [answer]\n\nMATERIAL:\n${v.material}` },
  { id: 7, icon: "📖", name: "API Doc Generator", cat: "Dev", desc: "Paste your code. Get clean, formatted API documentation.", inputs: [{ key: "code", label: "Code / API Definition", type: "textarea", placeholder: "Paste your functions, routes, or API code here..." }], prompt: (v) => `Generate comprehensive API documentation. Include: descriptions, parameters, return values, examples, and error cases.\n\nCODE:\n${v.code}` },
  { id: 8, icon: "🥊", name: "Debate Coach", cat: "Writing", desc: "Pick a topic & your side. Claude argues the opposite to stress-test you.", inputs: [{ key: "topic", label: "Debate Topic", type: "text", placeholder: "e.g. Remote work is better than office work" }, { key: "yourSide", label: "Your Position", type: "text", placeholder: "e.g. I think remote work is better" }], prompt: (v) => `I believe: ${v.yourSide} on: "${v.topic}"\n\nArgue the OPPOSITE side. Give 5 strong counterarguments with evidence. Then give me 3 weaknesses in my position.` },
  { id: 9, icon: "🔥", name: "Incident Report Writer", cat: "Business", desc: "Answer a few questions. Get a professional post-mortem report.", inputs: [{ key: "what", label: "What happened?", type: "textarea", placeholder: "Describe the incident..." }, { key: "impact", label: "Impact", type: "text", placeholder: "e.g. 2 hours downtime, 500 users affected" }, { key: "cause", label: "Root Cause", type: "text", placeholder: "e.g. Misconfigured deployment" }, { key: "fix", label: "How was it resolved?", type: "text", placeholder: "e.g. Rolled back to previous version" }], prompt: (v) => `Write a professional post-mortem. What: ${v.what}. Impact: ${v.impact}. Cause: ${v.cause}. Fix: ${v.fix}. Include: Executive summary, timeline, root cause analysis, impact, resolution, and prevention.` },
  { id: 10, icon: "📊", name: "Feedback Sorter", cat: "Analysis", desc: "Paste raw reviews. Get them categorized by theme & priority.", inputs: [{ key: "feedback", label: "Raw User Feedback", type: "textarea", placeholder: "Paste reviews, survey responses, or user feedback..." }], prompt: (v) => `Categorize this feedback by: 1) Theme, 2) Sentiment, 3) Priority. Highlight top 3 issues and top 3 praised features.\n\nFEEDBACK:\n${v.feedback}` },
  { id: 11, icon: "🎨", name: "Tone Rewriter", cat: "Writing", desc: "Paste any text. Rewrite it in your chosen tone instantly.", inputs: [{ key: "text", label: "Original Text", type: "textarea", placeholder: "Paste the text you want to rewrite..." }, { key: "tone", label: "Target Tone", type: "text", placeholder: "e.g. formal, casual, assertive, playful, concise" }], prompt: (v) => `Rewrite the following in a ${v.tone} tone. Keep the core meaning but transform the style.\n\nORIGINAL:\n${v.text}` },
  { id: 12, icon: "🎤", name: "Interview Prep Coach", cat: "Business", desc: "Enter job title & company. Get likely questions with answer frameworks.", inputs: [{ key: "role", label: "Job Title", type: "text", placeholder: "e.g. Product Manager" }, { key: "company", label: "Company", type: "text", placeholder: "e.g. Google" }, { key: "experience", label: "Your Experience Level", type: "text", placeholder: "e.g. 3 years in B2B SaaS" }], prompt: (v) => `Generate interview prep for ${v.role} at ${v.company}. Experience: ${v.experience}. Include: 8 likely questions, STAR framework guidance, company-specific tips, and 3 smart questions to ask.` },
  { id: 13, icon: "⚖️", name: "Legal Translator", cat: "Analysis", desc: "Paste dense legal text. Get a clear, jargon-free explanation.", inputs: [{ key: "legal", label: "Legal Text", type: "textarea", placeholder: "Paste the legal text or clause..." }], prompt: (v) => `Translate this legal text into plain English. Explain: what it means, obligations for each party, rights, and anything to watch out for.\n\nLEGAL TEXT:\n${v.legal}` },
  { id: 14, icon: "📝", name: "Changelog Writer", cat: "Dev", desc: "Paste a git diff or changes. Get a polished changelog entry.", inputs: [{ key: "changes", label: "Changes / Git Diff", type: "textarea", placeholder: "Paste git diff, PR description, or bullet list..." }, { key: "version", label: "Version (optional)", type: "text", placeholder: "e.g. v2.1.0" }], prompt: (v) => `Write a user-facing changelog entry ${v.version ? `for ${v.version}` : ""} from these changes. Group by: New Features, Improvements, Bug Fixes.\n\nCHANGES:\n${v.changes}` },
  { id: 15, icon: "🏷️", name: "Brand Voice Checker", cat: "Business", desc: "Paste brand guidelines + content. Get alignment score & suggestions.", inputs: [{ key: "guidelines", label: "Brand Voice Guidelines", type: "textarea", placeholder: "Paste your brand voice guidelines..." }, { key: "content", label: "Content to Check", type: "textarea", placeholder: "Paste the content to evaluate..." }], prompt: (v) => `Score this content (1-10) for brand voice alignment. Identify: off-brand phrases, what's working, and 5 improvement suggestions.\n\nGUIDELINES:\n${v.guidelines}\n\nCONTENT:\n${v.content}` },
  { id: 16, icon: "📈", name: "Data Story Generator", cat: "Analysis", desc: "Paste a table or stats. Get a narrative ready for slides.", inputs: [{ key: "data", label: "Data / Stats / Table", type: "textarea", placeholder: "Paste your data or numbers here..." }, { key: "audience", label: "Audience", type: "text", placeholder: "e.g. executive team, investors" }], prompt: (v) => `Transform this data into a compelling narrative for ${v.audience || "a general audience"}. Include: headline insight, story, key takeaways, and recommended action.\n\nDATA:\n${v.data}` },
  { id: 17, icon: "🗺️", name: "Onboarding Doc Builder", cat: "Business", desc: "Describe a role or process. Get a structured onboarding guide.", inputs: [{ key: "role", label: "Role or Process", type: "text", placeholder: "e.g. Marketing Manager" }, { key: "context", label: "Key Context", type: "textarea", placeholder: "Tools, key people, responsibilities, common tasks..." }], prompt: (v) => `Create an onboarding document for: ${v.role}.\n\nContext: ${v.context}\n\nInclude: Welcome overview, first day checklist, first week goals, key contacts, tools, processes, FAQs, and 30/60/90 day milestones.` },
  { id: 18, icon: "🔍", name: "Competitor Matrix", cat: "Business", desc: "Enter your product & competitors. Get a positioning breakdown.", inputs: [{ key: "product", label: "Your Product", type: "text", placeholder: "e.g. Notion - collaborative workspace" }, { key: "competitors", label: "Competitors", type: "text", placeholder: "e.g. Confluence, Coda, ClickUp" }, { key: "dimensions", label: "What to Compare", type: "text", placeholder: "e.g. pricing, features, target market" }], prompt: (v) => `Compare ${v.product} vs ${v.competitors} on: ${v.dimensions || "features, pricing, strengths, weaknesses, positioning"}. Format as structured analysis with key differentiators.` },
  { id: 19, icon: "🐛", name: "Bug Report Formatter", cat: "Dev", desc: "Describe a bug casually. Get a clean developer-ready report.", inputs: [{ key: "description", label: "Describe the bug (casually)", type: "textarea", placeholder: "Just tell me what went wrong..." }, { key: "env", label: "Environment (optional)", type: "text", placeholder: "e.g. Chrome 120, iOS 17, production" }], prompt: (v) => `Turn this into a professional bug report.\n\nDescription: ${v.description}\nEnvironment: ${v.env || "not specified"}\n\nFormat with: Summary, Steps to Reproduce, Expected, Actual, Environment, Severity, and investigation areas.` },
  { id: 20, icon: "💡", name: "Newsletter Idea Engine", cat: "Writing", desc: "Enter your niche & audience. Get 10 ideas with angles & hooks.", inputs: [{ key: "niche", label: "Your Niche / Topic", type: "text", placeholder: "e.g. personal finance, UX design" }, { key: "audience", label: "Your Audience", type: "text", placeholder: "e.g. early-career designers, solopreneurs" }], prompt: (v) => `Generate 10 newsletter ideas for a ${v.niche} newsletter targeting ${v.audience}. For each: title, angle/hook, why it resonates, and a suggested opening line.` },
];

const CATEGORIES = ["All", "Writing", "Analysis", "Dev", "Business"];

async function callClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map(b => b.text || "").join("\n");
}

export default function App() {
  const [activeTool, setActiveTool] = useState(null);
  const [values, setValues] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  const filtered = tools.filter(t => {
    const q = search.toLowerCase();
    return (category === "All" || t.cat === category) && (t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q));
  });

  const openTool = (tool) => { setActiveTool(tool); setValues({}); setResult(""); setError(""); };

  const run = async () => {
    if (!activeTool) return;
    const missing = activeTool.inputs.find(i => !values[i.key]?.trim());
    if (missing) { setError(`Please fill in: ${missing.label}`); return; }
    setLoading(true); setResult(""); setError("");
    try {
      const out = await callClaude(activeTool.prompt(values));
      setResult(out);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e8e8e0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #ff4d00; border-radius: 2px; }
        .tool-card { transition: all 0.15s ease; border: 1px solid #1e1e2e; background: #111118; cursor: pointer; border-radius: 12px; position: relative; overflow: hidden; -webkit-tap-highlight-color: transparent; }
        .tool-card:hover, .tool-card:active { border-color: #ff4d00; transform: translateY(-1px); box-shadow: 0 4px 20px #ff4d0022; }
        .run-btn { background: #ff4d00; color: #fff; border: none; font-weight: 700; font-size: 15px; padding: 14px 0; border-radius: 10px; cursor: pointer; transition: all 0.15s; width: 100%; letter-spacing: 0.5px; -webkit-tap-highlight-color: transparent; }
        .run-btn:hover:not(:disabled), .run-btn:active:not(:disabled) { background: #ff6a2a; }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .input-field { background: #0d0d18; border: 1px solid #2a2a3a; color: #e8e8e0; font-family: inherit; font-size: 14px; padding: 12px 14px; width: 100%; border-radius: 8px; resize: vertical; outline: none; transition: border-color 0.15s; -webkit-appearance: none; }
        .input-field:focus { border-color: #ff4d00; }
        .cat-btn { background: transparent; border: 1px solid #2a2a3a; color: #888; font-family: inherit; font-size: 12px; padding: 7px 14px; border-radius: 20px; cursor: pointer; transition: all 0.15s; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
        .cat-btn.active { border-color: #ff4d00; color: #ff4d00; background: #ff4d0015; }
        .modal-overlay { position: fixed; inset: 0; background: #000000dd; z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
        @media (min-width: 640px) { .modal-overlay { align-items: center; padding: 20px; } }
        .modal { background: #0d0d18; border: 1px solid #2a2a3a; border-top: 2px solid #ff4d00; width: 100%; max-height: 92vh; overflow-y: auto; border-radius: 16px 16px 0 0; }
        @media (min-width: 640px) { .modal { max-width: 600px; border-radius: 16px; border-top: 1px solid #2a2a3a; border-left: 2px solid #ff4d00; max-height: 88vh; } }
        .result-box { background: #070710; border: 1px solid #2a2a3a; border-left: 3px solid #ff4d00; padding: 16px; white-space: pre-wrap; font-size: 13px; line-height: 1.7; max-height: 300px; overflow-y: auto; border-radius: 8px; }
        .copy-btn { background: transparent; border: 1px solid #333; color: #888; font-family: inherit; font-size: 12px; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .copy-btn:hover { border-color: #ff4d00; color: #ff4d00; }
        .cat-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .loading-dots::after { content: ''; animation: dots 1.2s steps(4, end) infinite; }
        @keyframes dots { 0%,20%{content:'.'} 40%{content:'..'} 60%{content:'...'} 80%,100%{content:''} }
        .close-btn { background: #1a1a2e; border: none; color: #888; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 16px 16px", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: "#fff", lineHeight: 1.1 }}>
              Samir's <span style={{ color: "#ff4d00" }}>Tool Box</span> 🧰
            </div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, marginTop: 4 }}>20 AI-POWERED TOOLS</div>
          </div>
          <div style={{ fontSize: 28 }}>⚡</div>
        </div>
        <input
          style={{ background: "#111118", border: "1px solid #2a2a3a", color: "#e8e8e0", fontFamily: "inherit", fontSize: 14, padding: "10px 14px", outline: "none", width: "100%", borderRadius: 10 }}
          placeholder="🔍  Search tools..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #111" }}>
        <div className="cat-scroll">
          {CATEGORIES.map(c => (
            <button key={c} className={`cat-btn${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, paddingBottom: 40 }}>
        {filtered.map(tool => (
          <div key={tool.id} className="tool-card" style={{ padding: "16px 14px" }} onClick={() => openTool(tool)}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{tool.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 5, lineHeight: 1.3 }}>{tool.name}</div>
            <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 10 }}>{tool.desc}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, letterSpacing: 1, padding: "2px 7px", border: "1px solid #2a2a3a", color: "#555", borderRadius: 4, textTransform: "uppercase" }}>{tool.cat}</span>
              <span style={{ color: "#ff4d00", fontSize: 14 }}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeTool && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActiveTool(null)}>
          <div className="modal">
            {/* Modal Header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 32 }}>{activeTool.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 3 }}>{activeTool.name}</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{activeTool.desc}</div>
              </div>
              <button className="close-btn" onClick={() => setActiveTool(nul
