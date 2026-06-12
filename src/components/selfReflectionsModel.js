export function withReflectionResult(reflections, reflectionId, result, updatedAt = new Date().toISOString()) {
  const cleanResult = result.trim();
  return reflections.map((reflection) => (
    reflection.id === reflectionId
      ? { ...reflection, result: cleanResult, updatedAt }
      : reflection
  ));
}
