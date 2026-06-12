export function withReflectionEdits(reflections, reflectionId, form, updatedAt = new Date().toISOString()) {
  const cleanResult = form.result.trim();
  return reflections.map((reflection) => (
    reflection.id === reflectionId
      ? {
        ...reflection,
        date: form.date,
        text: form.text.trim(),
        result: cleanResult,
        updatedAt,
      }
      : reflection
  ));
}
