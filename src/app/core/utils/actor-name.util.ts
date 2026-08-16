// Detecta caracteres asiáticos: Coreano (Hangul), Chinês/Japonês (CJK/Kanji/Hanzi), Japonês (Kana) e Tailandês
export function isAsianScript(text?: string): boolean {
  if (!text) return false;
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u4E00-\u9FFF\u3040-\u30FF\u0E00-\u0E7F]/.test(text);
}

export function isLatinScript(text?: string): boolean {
  if (!text) return false;
  return /[a-zA-Z]/.test(text) && !isAsianScript(text);
}

// Normaliza o nome principal para alfabeto latino e o secundario para escrita nativa
export function formatActorNames(
  rawName: string,
  rawOriginalName?: string,
  alsoKnownAs: string[] = []
): { name: string; originalName?: string } {
  let romanized = (rawName || '').trim();
  let native = (rawOriginalName || '').trim() || undefined;

  // Caso 1: O nome principal veio em caracteres asiaticos (ex: "하영", "今井竜太郎")
  if (isAsianScript(romanized)) {
    const latinAlias = alsoKnownAs.find((alias) => isLatinScript(alias));

    if (latinAlias) {
      native = romanized;
      romanized = latinAlias.trim();
    } else if (native && isLatinScript(native)) {
      const temp = romanized;
      romanized = native;
      native = temp;
    } else {
      native = native !== romanized ? native : undefined;
    }
  } else {
    // Caso 2: O nome principal ja e romanizado (ex: "Jung Hae-in")
    if (!isAsianScript(native)) {
      const asianAlias = alsoKnownAs.find((alias) => isAsianScript(alias));
      if (asianAlias) {
        native = asianAlias.trim();
      } else if (native === romanized) {
        native = undefined;
      }
    }
  }

  return {
    name: romanized,
    originalName: native,
  };
}