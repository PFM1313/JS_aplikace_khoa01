import { deleteTask, deleteGroup, toggleTaskCompletion } from "./api";

// Populate the group select dropdown in the task form
function renderGroups(groups) {
  const taskGroupSelect = $("#taskGroup");
  taskGroupSelect.empty();
  taskGroupSelect.append('<option value="" selected>Select a group</option>'); // Default option

  groups.forEach((group) => {
    taskGroupSelect.append(
      `<option value="${group.id}">${group.name}</option>`
    );
  });

  const groupFilter = $("#groupFilter");
  groups.forEach((group) => {
    groupFilter.append(`<option value="${group.id}">${group.name}</option>`);
  });

  // Render groups list
  const groupList = $("#groupList");
  groupList.empty();
  groups.forEach((group) => {
    groupList.append(`<li class="list-group-item">${group.name}</li>`);
  });

  const groupItem = $(`
    <li class="list-group-item d-flex justify-content-between align-items-center>
      <div>
        <strong>${group.name}</strong><br>
      </div>
      <div>
        <button class="btn btn-danger btn-sm delete-group" data-id="${
          group.id
        }">Delete</button>
      </div>
    </li>
  `);
  // Handle delete group
  $(".delete-group").click(async function () {
    const groupId = $(this).data("id");
    await deleteGroup(groupId);
  });
}

// Populate the task list
function renderTasks(tasks) {
  const taskList = $("#taskList");
  taskList.empty();

  tasks.forEach((task) => {
    const isCompleted = task.is_completed;
    const taskItem = $(`
        <li class="list-group-item d-flex justify-content-between align-items-center ${
          isCompleted ? "bg-success bg-opacity-25" : ""
        }">
          <div>
            <strong>${task.name}</strong><br>
            Group: ${task.group?.name || "No Group"} | Created: ${new Date(
      task.created_at
    ).toLocaleString()}
          </div>
          <div>
            <button class="btn ${
              isCompleted ? "btn-warning" : "btn-success"
            } btn-sm toggle-completed" data-id="${task.id}">
              ${isCompleted ? "Unmark" : "Complete"}
            </button>
            <button class="btn btn-danger btn-sm delete-task" data-id="${
              task.id
            }">Delete</button>
          </div>
        </li>
      `);

    taskItem.click(() => openTaskModal(task));

    taskList.append(taskItem);
  });

  // Handle delete task
  $(".delete-task").click(async function () {
    const taskId = $(this).data("id");
    await deleteTask(taskId);
  });

  // Handle toggle completion
  $(".toggle-completed").click(async function () {
    const taskId = $(this).data("id");
    const task = tasks.find((t) => t.id === taskId);
    const newCompletedStatus = !task.is_completed;

    await toggleTaskCompletion(taskId, newCompletedStatus);
  });
}

let currentTask = {};

function openTaskModal(task) {
  $("#modalTaskName").text(task.name);
  $("#modalTaskDescription").text(task.description || "No description");
  $("#modalTaskGroup").text(task.group?.name || "No group");
  $("#modalTaskCreatedAt").text(new Date(task.created_at).toLocaleString());
  $("#modalTaskStartDate").text(
    task.start ? new Date(task.start).toLocaleDateString() : "N/A"
  );
  $("#modalTaskEndDate").text(
    task.end ? new Date(task.end).toLocaleDateString() : "N/A"
  );
  $("#modalTaskStatus").text(task.is_completed ? "Completed" : "Pending");

  currentTask = task;
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("taskDetailModal"));
  modal.show();
}

// Function to populate the Edit Task Modal
function openEditTaskModal(task) {
  document.getElementById("editTaskName").value = task.name;
  document.getElementById("editTaskDescription").value = task.description;

  console.log(task.start, task.end);
  document.getElementById("editTaskStartDate").value = task.start;

  document.getElementById("editTaskEndDate").value = task.end;
}

export {
  renderGroups,
  renderTasks,
  openEditTaskModal,
  openTaskModal,
  currentTask,
};
