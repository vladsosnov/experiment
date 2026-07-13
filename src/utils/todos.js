export function reorderTodos(todos, fromId, toId) {
  if (fromId === toId) return todos;

  const fromIndex = todos.findIndex((todo) => todo.id === fromId);
  const toIndex = todos.findIndex((todo) => todo.id === toId);

  if (fromIndex === -1 || toIndex === -1) return todos;

  const next = [...todos];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return groupTodosByCompletion(next);
}

export function countIncompleteTodos(todos = []) {
  return countTodoItems(todos) - countCompletedTodoItems(todos);
}

export function isTodosFullyComplete(todos = []) {
  return todos.length > 0 && countIncompleteTodos(todos) === 0;
}

export function countTodoItems(todos = []) {
  return todos.reduce((count, todo) => {
    const subtasks = getSubtasks(todo);
    if (subtasks.length > 0) {
      return count + subtasks.length;
    }

    return count + 1;
  }, 0);
}

export function countCompletedTodoItems(todos = []) {
  return todos.reduce((count, todo) => {
    const subtasks = getSubtasks(todo);
    if (subtasks.length > 0) {
      return count + subtasks.filter((subtask) => subtask.completed).length;
    }

    return todo.completed ? count + 1 : count;
  }, 0);
}

export function groupTodosByCompletion(todos = []) {
  return [
    ...todos.filter((todo) => !todo.completed),
    ...todos.filter((todo) => todo.completed),
  ];
}

export function toggleTodoCompletion(todos, id) {
  return groupTodosByCompletion(todos.map((todo) => {
    if (todo.id !== id) return todo;

    const completed = !todo.completed;
    const subtasks = getSubtasks(todo).map((subtask) => ({ ...subtask, completed }));

    return {
      ...todo,
      completed,
      ...(hasSubtasksProperty(todo) ? { subtasks } : {}),
    };
  }));
}

export function addSubtaskToTodo(todos, todoId, subtask) {
  const text = subtask.text.trim();
  if (!text) return todos;

  return groupTodosByCompletion(todos.map((todo) => {
    if (todo.id !== todoId) return todo;

    const subtasks = [
      ...getSubtasks(todo),
      { ...subtask, text, completed: Boolean(subtask.completed) },
    ];

    return withSyncedSubtasks(todo, subtasks);
  }));
}

export function toggleSubtaskCompletion(todos, todoId, subtaskId) {
  return groupTodosByCompletion(todos.map((todo) => {
    if (todo.id !== todoId) return todo;

    const subtasks = getSubtasks(todo).map((subtask) => (
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    ));

    return withSyncedSubtasks(todo, subtasks);
  }));
}

export function updateSubtaskText(todos, todoId, subtaskId, text) {
  const trimmed = text.trim();
  if (!trimmed) return todos;

  return todos.map((todo) => {
    if (todo.id !== todoId) return todo;

    return {
      ...todo,
      subtasks: getSubtasks(todo).map((subtask) => (
        subtask.id === subtaskId ? { ...subtask, text: trimmed } : subtask
      )),
    };
  });
}

export function deleteSubtaskFromTodo(todos, todoId, subtaskId) {
  return groupTodosByCompletion(todos.map((todo) => {
    if (todo.id !== todoId) return todo;

    const subtasks = getSubtasks(todo).filter((subtask) => subtask.id !== subtaskId);
    if (subtasks.length === 0) {
      return { ...todo, subtasks };
    }

    return withSyncedSubtasks(todo, subtasks);
  }));
}

export function getSubtasks(todo) {
  return Array.isArray(todo?.subtasks) ? todo.subtasks : [];
}

function hasSubtasksProperty(todo) {
  return Object.prototype.hasOwnProperty.call(todo, 'subtasks');
}

function withSyncedSubtasks(todo, subtasks) {
  return {
    ...todo,
    completed: subtasks.length > 0 ? subtasks.every((subtask) => subtask.completed) : todo.completed,
    subtasks,
  };
}
