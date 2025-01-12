import { currentFilterGroup,currentFilterCompleted,currentSortDirection,currentSortBy} from "./main";
import { renderGroups, renderTasks, currentTask } from "./render";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_API_URL;
const supabaseKey = import.meta.env.VITE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Fetch groups from the database
async function fetchGroups() {
  const { data, error } = await supabase.from("groups").select("*");
  if (error) {
    console.error("Error fetching groups:", error);
  } else {
    renderGroups(data);
  }
}

// Fetch tasks from the database
async function fetchTasks() {
  let query = supabase.from("tasks").select("*, group:groups(name)");

   // Apply group filter if it's not empty
  if (currentFilterGroup) {
    query = query.eq("group_id", currentFilterGroup);
  }

  // Apply completed filter if needed
  if (currentFilterCompleted != null) {
    query = query.eq("is_completed", currentFilterCompleted);
  }

  // Apply sorting
  query = query.order(currentSortBy, {
    ascending: currentSortDirection === "asc",
  });

  const { data, error } = await query
  if (error) {
    console.error("Error fetching tasks:", error);
  } else {
    renderTasks(data);
  }
}

// Add group to the database
async function addGroup(group) {
  const { data, error } = await supabase.from("groups").insert(group);
  if (error) {
    console.error("Error adding group:", error);
  } else {
    fetchGroups(); // Refresh the group list and dropdown
  }
}

async function deleteGroup(groupId) {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) {
    console.error("Error deleting task:", error);
    alert("Failed to delete the task.");
  } else {
    alert("Task deleted successfully!");
    fetchTasks(); // Refresh the task list
  }
}

// Add task to the database
async function addTask(task) {
  const { data, error } = await supabase.from("tasks").insert(task);
  if (error) {
    console.error("Error adding task:", error);
  } else {
    fetchTasks(); // Refresh the task list
  }
}

async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) {
    console.error("Error deleting task:", error);
    alert("Failed to delete the task.");
  } else {
    alert("Task deleted successfully!");
    fetchTasks(); // Refresh the task list
  }
}

async function toggleTaskCompletion(taskId, is_completed) {
  const { error } = await supabase
    .from("tasks")
    .update({ is_completed })
    .eq("id", taskId);

  if (error) {
    console.error("Error toggling task completion:", error);
    alert("Failed to update task status.");
  } else {
    alert("Status of the task has been changed!");
    fetchTasks(); // Refresh the task list
  }
}

async function updateTask(updatedTask) {
  const { error } = await supabase
    .from("tasks")
    .update(updatedTask)
    .eq("id", currentTask.id);

  if (error) {
    console.error("Error task update:", error);
    alert("Failed to update task.");
  } else {
    alert(`Task update completed!`);
    fetchTasks(); // Refresh the task list
    // Close the modal
    bootstrap.Modal.getInstance(
      document.getElementById("editTaskModal")
    ).hide();
  }
}

export {
  fetchGroups,
  fetchTasks,
  deleteTask,
  deleteGroup,
  toggleTaskCompletion,
  updateTask,
  addTask,
  addGroup,
};
