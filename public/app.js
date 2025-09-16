// Frontend logic for the local story generator
const el = (id) => document.getElementById(id);
const topic = el('topic');
const lengthSel = el('length');
const perspectiveSel = el('perspective');
const audienceSel = el('audience');
const formatSel = el('format');
const genreSel = el('genre');
const languageSel = el('language');
const generateBtn = el('generate');
const copyBtn = el('copy');
const clearBtn = el('clear');
const output = el('output');
const statusEl = el('status');
const sampleBtn = el('sample');

sampleBtn.addEventListener('click', () => {
  topic.value = "A bike courier on a floating city is tasked with delivering a mysterious package that everyone seems to want.";
});

clearBtn.addEventListener('click', () => {
  topic.value = "";
  output.textContent = "";
  statusEl.textContent = "";
});

copyBtn.addEventListener('click', async () => {
  if (!output.textContent.trim()) return;
  await navigator.clipboard.writeText(output.textContent);
  statusEl.textContent = "Copied to clipboard ✅";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});

function inferTargetWords(val) {
  if (val.startsWith("Very short")) return 300;
  if (val.startsWith("Short")) return 800;
  if (val.startsWith("Medium")) return 1500;
  if (val.startsWith("Long")) return 2500;
  if (val.startsWith("Chapter")) return 4000;
  return null; // Auto
}

function buildUserPrompt(fields) {
  const parts = [];
  parts.push(`Topic/seed: ${fields.topic}`);
  if (fields.genre !== 'Auto') parts.push(`Genre: ${fields.genre}`);
  if (fields.perspective !== 'Auto') parts.push(`Narrative perspective: ${fields.perspective}`);
  if (fields.audience !== 'Auto') parts.push(`Audience: ${fields.audience}`);
  if (fields.format !== 'Auto') parts.push(`Story format: ${fields.format}`);
  if (fields.targetWords) parts.push(`Target length: ~${fields.targetWords} words`);
  const langLine = fields.language !== 'Auto' ? `Write in ${fields.language}.` : "Write in the language that best suits the audience (default: English).";
  return `Write an original, coherent, and engaging story.\n${parts.join("\n")}\n\nRequirements:\n- Open with a strong hook in the first 2 sentences.\n- Show, don't tell; use vivid sensory details.\n- Maintain consistent character behavior and world rules.\n- Keep the pacing appropriate for the selected length.\n- Deliver a satisfying resolution (or a purposeful cliffhanger if format demands it).\n- Avoid repetition and generic phrases.\n- ${langLine}\n\nReturn only the story (no prefaces, no disclaimers).`;
}

generateBtn.addEventListener('click', async () => {
  const topicVal = topic.value.trim();
  if (!topicVal) {
    statusEl.textContent = "Please enter a topic or click 'Try a sample'.";
    return;
  }
  const fields = {
    topic: topicVal,
    length: lengthSel.value,
    perspective: perspectiveSel.value,
    audience: audienceSel.value,
    format: formatSel.value,
    genre: genreSel.value,
    language: languageSel.value,
    targetWords: inferTargetWords(lengthSel.value)
  };

  const payload = { ...fields };
  payload.prompt = buildUserPrompt(fields);

  output.textContent = "";
  statusEl.textContent = "Generating story locally… (make sure Ollama is running)";
  generateBtn.disabled = true;
  copyBtn.disabled = true;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
    const data = await res.json();
    output.textContent = data.story || "";
    statusEl.textContent = "Done ✅";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error: " + (err?.message || err);
  } finally {
    generateBtn.disabled = false;
    copyBtn.disabled = false;
  }
});
