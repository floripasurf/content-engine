const brandVisuals: Record<string, string[]> = {
  chamei: ["home repair", "plumber working", "handyman tools", "house interior", "smartphone app", "happy customer"],
  delas: ["beauty salon", "nail art", "woman makeup", "hair styling", "spa treatment", "happy woman"],
  soninho: ["child sleeping", "bedtime story", "parent child", "night sky stars", "peaceful bedroom"],
  simplifica: ["elderly phone", "senior technology", "grandparent", "simple interface", "accessibility"],
  spark: ["couple date", "smartphone dating", "young people", "coffee shop", "romantic"],
  blackcube: ["modern office", "laptop code", "digital agency", "startup team", "data dashboard"],
  squad: ["office team", "performance review", "business meeting", "teamwork", "feedback"],
};

const ptToEnVisuals: [string, string][] = [
  ["torneira", "faucet repair"],
  ["encanador", "plumber working"],
  ["eletricista", "electrician"],
  ["cozinha", "kitchen"],
  ["banheiro", "bathroom"],
  ["celular", "smartphone"],
  ["telefone", "phone call"],
  ["carro", "car repair"],
  ["casa", "house interior"],
  ["jardim", "garden"],
  ["piscina", "swimming pool"],
  ["ar condicionado", "air conditioning"],
  ["pintor", "house painting"],
  ["mudança", "moving boxes"],
  ["limpeza", "cleaning"],
  ["delivery", "food delivery"],
  ["restaurante", "restaurant"],
  ["salão", "beauty salon"],
  ["cabelo", "hair styling"],
  ["unha", "nail art"],
  ["maquiagem", "makeup"],
  ["bebê", "baby care"],
  ["criança", "child playing"],
  ["escola", "school classroom"],
  ["médico", "doctor office"],
  ["dentista", "dentist"],
  ["academia", "gym fitness"],
  ["yoga", "yoga meditation"],
  ["café", "coffee shop"],
  ["computador", "laptop computer"],
  ["escritório", "office desk"],
  ["reunião", "business meeting"],
  ["equipe", "team collaboration"],
  ["família", "family together"],
  ["amigos", "friends hanging out"],
  ["festa", "party celebration"],
  ["viagem", "travel adventure"],
  ["praia", "beach sunset"],
  ["noite", "night city"],
  ["manhã", "morning routine"],
  ["dinheiro", "money finance"],
  ["conta", "bills payment"],
  ["orçamento", "budget calculator"],
  ["avaliação", "review stars"],
  ["whatsapp", "phone messaging"],
  ["grupo", "group chat"],
  ["indicação", "word of mouth"],
  ["profissional", "professional worker"],
];

export function extractKeywords(
  script: { hook: string; body: string },
  brandSlug: string
): string[] {
  const brandTerms = brandVisuals[brandSlug] || ["urban lifestyle", "technology", "people"];
  const combined = `${script.hook} ${script.body}`.toLowerCase();

  const scriptTerms: string[] = [];
  for (const [pt, en] of ptToEnVisuals) {
    if (combined.includes(pt) && scriptTerms.length < 4) {
      scriptTerms.push(en);
    }
  }

  // Combine: script-specific first, then brand defaults
  const all = [...scriptTerms, ...brandTerms];
  return [...new Set(all)].slice(0, 6);
}

export { brandVisuals };
