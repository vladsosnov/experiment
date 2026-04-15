export function reorderTodos(todos, fromId, toId) {
  if (fromId === toId) return todos;

  const fromIndex = todos.findIndex((todo) => todo.id === fromId);
  const toIndex = todos.findIndex((todo) => todo.id === toId);

  if (fromIndex === -1 || toIndex === -1) return todos;

  const next = [...todos];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
