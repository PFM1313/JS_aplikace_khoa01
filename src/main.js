import "./style.css";
import { handleAuthClick, handleSignoutClick, addEvent } from "./google";
import { openEditTaskModal, currentTask } from "./render";
import { fetchGroups, fetchTasks, addTask, addGroup, updateTask} from "./api";
import { convertToPragueTime } from "./utils";

let isGroupOpen = false;
let isTaskOpen = false;

let currentFilterGroup = "";
let currentFilterCompleted = null;
let currentSortBy = "created_at";
let currentSortDirection = "asc";

// Switch between forms and tabs
$("#showGroupForm").click(() => {
  if (isGroupOpen) {
    // Close group form
    $("#groupForm").addClass("d-none");
    $("#showGroupForm")
      .addClass("btn-outline-primary")
      .removeClass("btn-primary");
    isGroupOpen = false;
  } else {
    // Open group form and close task form if open
    $("#groupForm").removeClass("d-none");
    $("#taskForm").addClass("d-none");

    $("#showGroupForm")
      .addClass("btn-primary")
      .removeClass("btn-outline-primary");
    $("#showTaskForm")
      .addClass("btn-outline-secondary")
      .removeClass("btn-primary");

    isGroupOpen = true;
    isTaskOpen = false;
  }
});

$("#showTaskForm").click(() => {
  if (isTaskOpen) {
    // Close task form
    $("#taskForm").addClass("d-none");
    $("#showTaskForm")
      .addClass("btn-outline-secondary")
      .removeClass("btn-primary");
    isTaskOpen = false;
  } else {
    // Open task form and close group form if open
    $("#taskForm").removeClass("d-none");
    $("#groupForm").addClass("d-none");

    $("#showTaskForm")
      .addClass("btn-primary")
      .removeClass("btn-outline-secondary");
    $("#showGroupForm")
      .addClass("btn-outline-primary")
      .removeClass("btn-primary");

    isTaskOpen = true;
    isGroupOpen = false;
  }
});

// Handle the form submission for creating a group
$("#groupFormContent").submit((event) => {
  event.preventDefault();
  const groupName = $("#groupName").val();

  if (groupName) {
    addGroup({ name: groupName });
    $("#groupName").val(""); // Clear the form
  }
});

// Handle the form submission for creating a task
$("#taskFormContent").submit((event) => {
  event.preventDefault();
  const taskName = $("#taskName").val();
  const taskDescription = $("#taskDescription").val();
  const taskGroup = $("#taskGroup").val();
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();

  if (!taskName || !taskGroup || !startDate || !endDate) {
    alert("Please fill in all required fields.");
    return;
  }

  if (endDate < startDate) {
    alert("Invalid end date.");
    return
  }

  if (taskName && taskGroup) {
    addTask({
      name: taskName,
      description: taskDescription,
      group_id: taskGroup,
      start: startDate,
      end: endDate,
    });
    addEvent({
      name: taskName,
      description: taskDescription,
      start: convertToPragueTime(startDate),
      end: convertToPragueTime(endDate),
    });
    $("#taskName").val(""); // Clear the form
    $("#taskDescription").val(""); // Clear the form
  }
});

// Handle Group Filter Change
$("#groupFilter").change(function () {
  currentFilterGroup = $(this).val(); // Get selected group ID
  fetchTasks(currentFilterGroup); // Fetch tasks with updated filter
});

// Handle Sorting Option Change
$("#sortBy").change(function () {
  currentSortBy = $(this).val(); // Get selected sort field
  fetchTasks(currentSortBy); // Fetch tasks with updated sort
});

// Handle Sorting Direction Change
$("#sortDirection").change(function () {
  currentSortDirection = $(this).val(); // Get selected sort direction
  fetchTasks(currentSortDirection); // Fetch tasks with updated sort direction
});

// Update currentFilterCompleted based on user selection
$("#filterCompleted").change(function () {
  const filterValue = $(this).val();
  currentFilterCompleted = filterValue === "" ? null : filterValue === "true";
  fetchTasks(currentFilterCompleted); // Re-fetch tasks with the new filter
});

// Attach event listener to the Edit Task button
document
  .getElementById("taskDetailModal")
  .addEventListener("show.bs.modal", function (event) {
    // Example: Pass the currentTask data to openEditTaskModal when opening the modal
    document
      .querySelector("#taskDetailModal .btn-primary")
      .addEventListener("click", () => {
        openEditTaskModal(currentTask);
      });
  });

// Function to handle saving task changes
document
  .getElementById("saveTaskChanges")
  .addEventListener("click", async () => {
    const updatedTask = {
      name: document.getElementById("editTaskName").value,
      description: document.getElementById("editTaskDescription").value,
      start: document.getElementById("editTaskStartDate").value,
      end: document.getElementById("editTaskEndDate").value,
    };

    await updateTask(updatedTask);
  });

// Initialize the page by fetching existing groups and tasks
$(document).ready(() => {
  $("#authorize_button").on("click", handleAuthClick);
  $("#signout_button").on("click", handleSignoutClick);

  const tabLinks = $(".nav-tabs .nav-link");
  const tabContent = $(".tab-content .tab-pane");

  // Function to switch tabs based on URL parameter
  function switchToTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    const activeTab = params.get("tab");

    if (activeTab) {
      tabLinks.removeClass("active");
      tabContent.removeClass("show active");

      const targetTab = tabLinks.filter(`[href="#${activeTab}"]`);
      const targetContent = tabContent.filter(`#${activeTab}`);

      targetTab.addClass("active");
      targetContent.addClass("show active");
    }
  }

  // Update URL parameter when a tab is clicked
  tabLinks.on("click", function () {
    const tabId = $(this).attr("href").substring(1); // Remove the "#" from href
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tabId);

    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
  });

  // Switch to the correct tab on page load
  switchToTabFromURL();
  fetchGroups();
  fetchTasks();
});

export{
  currentFilterGroup,
  currentFilterCompleted,
  currentSortBy,
  currentSortDirection,
};