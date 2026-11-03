// Reglas simples de la comunidad. En producción esto lo haría el servidor con revisión humana.
export function moderate(raw = '') {
  const t = raw.trim()
  if (t.length < 15) return { ok: false, reason: 'Cuéntanos un poco más. Escribe al menos 15 caracteres.' }
  if (t.length > 500) return { ok: false, reason: 'Es muy larga. Resúmela en menos de 500 caracteres.' }
  if (/https?:\/\/|www\.|\.com\b|\.co\b/i.test(t)) return { ok: false, reason: 'No se permiten enlaces en las preguntas.' }
  if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(t)) return { ok: false, reason: 'No compartas correos en la comunidad.' }
  if (/\b3\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/.test(t)) return { ok: false, reason: 'No compartas teléfonos en la comunidad.' }
  if (/contrase[ñn]a|\bclave\b|\bcvv\b|\bpin\b|n[uú]mero de (tarjeta|cuenta)/i.test(t)) return { ok: false, reason: 'Nunca compartas claves ni datos de tarjetas o cuentas.' }
  if (/ganancias? garantizad|doblar? tu (plata|dinero)|inversi[oó]n segura|escr[ií]beme al privado|gana dinero f[aá]cil|pr[eé]stamos? inmediato/i.test(t)) return { ok: false, reason: 'Parece una promoción. En esta comunidad solo se hacen preguntas y se comparten experiencias.' }
  return { ok: true }
}
