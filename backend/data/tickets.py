TICKETS = [
    {
        "id": "BUG-001",
        "type": "Bug",
        "title": "Status toggle skips 'in-progress'",
        "priority": "High",
        "file": "App.jsx",
        "description": "When clicking the status button on a task, it jumps from 'todo' directly to 'done', skipping the 'in-progress' state entirely. Expected behavior: todo → in-progress → done → todo.",
        "acceptance_criteria": ["Status cycles through all three states: todo → in-progress → done → todo", "Each click advances to the next state only"]
    },
    {
        "id": "BUG-002",
        "type": "Bug",
        "title": "Filter doesn't show all 'todo' tasks (case mismatch)",
        "priority": "Medium",
        "file": "api.js",
        "description": "Clicking the 'Todo' filter doesn't show all todo tasks. One task is missing from the filtered view. There's a case inconsistency in the data.",
        "acceptance_criteria": ["All todo tasks appear when 'Todo' filter is active", "Data uses consistent lowercase status values"]
    },
    {
        "id": "BUG-003",
        "type": "Bug",
        "title": "Delete doesn't update UI optimistically",
        "priority": "Low",
        "file": "App.jsx",
        "description": "When deleting a task, the UI waits for the API response before removing the task from the list. This causes a noticeable delay. The UI should update immediately.",
        "acceptance_criteria": ["Task is removed from UI immediately on delete click", "API call happens in background"]
    },
    {
        "id": "FEAT-001",
        "type": "Feature",
        "title": "Add due date to tasks",
        "priority": "High",
        "file": "AddTask.jsx",
        "description": "Tasks currently have no due date. Add a due date field to the task creation form, store it, and display it in the task list.",
        "acceptance_criteria": ["AddTask form has a date input for due date", "Due date is stored with the task", "TaskList displays the due date", "Due date is optional"]
    },
    {
        "id": "FEAT-002",
        "type": "Feature",
        "title": "Add task count badges to filter buttons",
        "priority": "Medium",
        "file": "App.jsx",
        "description": "The filter buttons (All, Todo, In Progress, Done) should show a count of how many tasks match each filter.",
        "acceptance_criteria": ["Each filter button shows a badge with the count", "Counts update when tasks are added/deleted/status-changed", "Badge is visually distinct (e.g. small circle)"]
    }
]
