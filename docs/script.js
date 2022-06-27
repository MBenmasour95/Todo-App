// DOM Elements
const toggleBtnsWrapper = document.getElementById("toggle-btns");
const toggleBtns = document.querySelectorAll(".toggle-btns button");
const form = document.getElementById("form");
const input = document.getElementById("input");
const todosWrapper = document.getElementById("todos");
const controlsWrapper = document.getElementById("controls");
const counterEl = document.getElementById("counter");
const filtersWrapper = document.getElementById("filters");
const filterBtns = document.querySelectorAll(".filters button");
const clearBtn = document.getElementById("clear-btn");
const instructions = document.getElementById("instructions");

// Variables
let todos = [];
let completed = false;

// Add New Todo
function addNewTodo(e) {
  e.preventDefault();

  if (input.value !== "") {
    const obj = {
      id: Math.floor(Math.random() * 100000),
      text: input.value,
      completed: completed,
    };

    todos.push(obj);
    renderTodos(todos);
    saveTodosInLS(todos);

    input.value = "";
    input.focus();
  } else {
    alert("Please enter a TODO.");
  }
}

// Render Todos
function renderTodos(todos) {
  todosWrapper.innerHTML = null;

  todos.forEach((todo) => {
    const { id, text, completed } = todo;
    const item = document.createElement("li");
    item.className = `todo-item d-flex ${completed ? "completed" : "active"}`;
    item.setAttribute("data-id", id);
    item.setAttribute("draggable", true);

    item.innerHTML = `
      <input type="checkbox" id="${id}" ${completed ? "checked" : ""}/>
      <label class="checkbox" for="${id}">
      <img
          src="./images/icon-check.svg"
          alt="check"
          class="p-absolute-center"
      />
      </label>
      <label class="text" for="${id}">
          ${text}
      </label>

      <button class="delete-btn">
          <img src="./images/icon-cross.svg" alt="cross" />
      </button>
    `;

    todosWrapper.appendChild(item);
    controlsWrapper.classList.add("show");
    instructions.classList.add("show");

    item.querySelector("input").addEventListener("click", markTodo);
    item.querySelector(".delete-btn").addEventListener("click", deleteTodo);

    if (window.location.hash === "#all" || window.location.hash === "") {
      item.style.display = "flex";
    } else if (
      window.location.hash === "#active" &&
      item.classList.contains("active")
    ) {
      item.style.display = "flex";
    } else if (
      window.location.hash === "#completed" &&
      item.classList.contains("completed")
    ) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }

    filterBtns.forEach((btn) => {
      const filter = btn.dataset.filter;
      const hash = window.location.hash.replace(/^#/, "");
      btn.classList.remove("active");

      if (filter === hash) {
        btn.classList.add("active");
      } else if (hash === "" && filter === "all") {
        btn.classList.add("active");
      }
    });

    item.addEventListener("dragstart", dragAndDrop);
    item.addEventListener("touchstart", dragAndDrop);
    item.addEventListener("dragover", dragAndDrop);
    item.addEventListener("touchmove", dragAndDrop);
    item.addEventListener("dragend", dragAndDrop);
    item.addEventListener("touchend", dragAndDrop);
  });

  updateCounter();
}

// Mark Todo As Completed
function markTodo(e) {
  const id = +e.target.parentElement.dataset.id;

  if (e.target.checked) {
    e.target.parentElement.classList.replace("active", "completed");
  } else {
    e.target.parentElement.classList.replace("completed", "active");
  }

  updateCompletedInLS(id);
  updateCounter();
}

// Delete Todo From DOM
function deleteTodo(e) {
  const id = +e.target.parentElement.dataset.id;

  e.target.parentElement.remove();

  if (
    (window.location.hash === "#active" &&
      todosWrapper.querySelectorAll(".active").length === 0) ||
    (window.location.hash === "#completed" &&
      todosWrapper.querySelectorAll(".completed").length === 0)
  ) {
    filterBtns[0].click();
  }

  deleteTodoFromLS(id);
  updateCounter();

  if (todos.length === 0) {
    controlsWrapper.classList.remove("show");
    instructions.classList.remove("show");
  }
}

// Update Counter
function updateCounter() {
  let counter = todos.filter((todo) => todo.completed !== true);
  counterEl.innerText = `${counter.length} items left`;

  return counter.length;
}

// Filter Todos
function filterTodos(e) {
  const children = todosWrapper.childNodes;
  const filter = e.target.dataset.filter;
  const activeTodosLength = todosWrapper.querySelectorAll(".active").length;
  const completedTodosLength =
    todosWrapper.querySelectorAll(".completed").length;

  if (filter === "active" && activeTodosLength === 0) {
    alert("You don't have any active todos.");
    return;
  } else if (filter === "completed" && completedTodosLength === 0) {
    alert("You don't have any completed todos.");
    return;
  } else {
    filterBtns.forEach((btn) => {
      btn.classList.remove("active");
    });

    e.target.classList.add("active");
  }

  children.forEach((todo) => {
    if (filter === "all") {
      todo.style.display = "flex";
      window.location.hash = "all";
    } else if (filter === "active" && todo.classList.contains("active")) {
      todo.style.display = "flex";
      window.location.hash = "active";
    } else if (filter === "completed" && todo.classList.contains("completed")) {
      todo.style.display = "flex";
      window.location.hash = "completed";
    } else if (e.target.classList.contains("btn-group")) {
      return;
    } else {
      todo.style.display = "none";
    }

    const checkbox = todo.querySelector("input");
    checkbox.addEventListener("click", (e) => {
      if (e.target.checked && filter === "active") {
        todo.style.display = "none";

        if (todosWrapper.querySelectorAll(".active").length === 0) {
          filterBtns[0].click();
        }
      } else if (!e.target.checked && filter === "completed") {
        todo.style.display = "none";

        if (todosWrapper.querySelectorAll(".completed").length === 0) {
          filterBtns[0].click();
        }
      } else {
        todo.style.display = "flex";
      }
    });
  });
}

// Clear All Completed Todos
function clearCompletedTodos() {
  const completedTodos = todosWrapper.querySelectorAll(".completed");

  completedTodos.forEach((todo) => {
    todo.remove();
  });

  if (window.location.hash === "#completed") {
    filterBtns[0].click();
  }

  clearAllCompletedTodosFromLS();

  if (todos.length === 0) {
    controlsWrapper.classList.remove("show");
    instructions.classList.remove("show");

    window.location.hash = "";
  }
}

// Toggle Dark and Light Mode
function toggleLightAndDarkMode(e) {
  const activeClass = e.target.classList.contains("active");
  let lightMode = "";

  if (activeClass && e.target.nextElementSibling) {
    lightMode = "on";
    document.body.classList.add("light-mode");
    e.target.classList.remove("active");
    e.target.nextElementSibling.classList.add("active");
  } else if (activeClass && e.target.previousElementSibling) {
    lightMode = "off";
    document.body.classList.remove("light-mode");
    e.target.classList.remove("active");
    e.target.previousElementSibling.classList.add("active");
  }

  localStorage.setItem("light-mode", lightMode);
}

// Render Light Mode
function renderLightMode() {
  const lightMode = getLightModeFromLS();
  toggleBtns.forEach((btn) => btn.classList.remove("active"));
  if (lightMode === "on") {
    document.body.classList.add("light-mode");
    toggleBtns[1].classList.add("active");
  } else {
    document.body.classList.remove("light-mode");
    toggleBtns[0].classList.add("active");
  }
}

// Drag and Drop Todos
function dragAndDrop(e) {
  if (e.type === "dragstart" || e.type === "touchstart") {
    e.currentTarget.classList.add("dragging");
  }

  if (e.type === "dragover" || e.type === "touchmove") {
    e.preventDefault();

    const parentElement = e.currentTarget.parentNode;
    const afterElement = getDragAfterElement(
      parentElement,
      e.clientY || e.changedTouches[0].clientY
    );

    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
      parentElement.appendChild(draggable);
    } else {
      parentElement.insertBefore(draggable, afterElement);
    }
  }

  if (e.type === "dragend" || e.type === "touchend") {
    e.currentTarget.classList.remove("dragging");
    const newTodos = [];
    const elements =
      e.currentTarget.parentElement.querySelectorAll(".todo-item");
    elements.forEach((element) => {
      const obj = {
        id: +element.dataset.id,
        text: element.querySelector(".text").innerText,
        completed: element.querySelector("input").checked,
      };
      newTodos.push(obj);
      todos = newTodos;
      saveTodosInLS(todos);
    });
  }
}

// Get Drag After Element
function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".todo-item:not(.dragging)")];

  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Set Todos To LocalStorage
function saveTodosInLS(todos) {
  return localStorage.setItem("todos", JSON.stringify(todos));
}

// Get Todos Ftom LocalStorage
function getTodosFromLS() {
  return localStorage.getItem("todos") !== null
    ? JSON.parse(localStorage.getItem("todos"))
    : [
        { id: 1, text: "Complete online Javascript course", completed: true },
        { id: 2, text: "Jog around the park 3x", completed: false },
        { id: 3, text: "10 minutes meditation", completed: false },
        { id: 4, text: "Read for 1 hour", completed: false },
        {
          id: 5,
          text: "Complete Todo App on Frontend Mentor",
          completed: false,
        },
      ];
}

// Update LocalStorage
function updateCompletedInLS(id) {
  todos.find((todo) => {
    if (todo.id === id) {
      todo.completed = !todo.completed;
    }
  });

  localStorage.setItem("todos", JSON.stringify(todos));
}

// Delete Todo From LocalStorage
function deleteTodoFromLS(id) {
  todos = todos.filter((todo) => todo.id !== id);

  localStorage.setItem("todos", JSON.stringify(todos));
}

// Clear All Todo Completed from LocalStorage
function clearAllCompletedTodosFromLS() {
  todos = todos.filter((todo) => todo.completed !== true);

  localStorage.setItem("todos", JSON.stringify(todos));
}

// Get Mode From LocalStorage
function getLightModeFromLS() {
  return localStorage.getItem("light-mode");
}

// Setup Todos
function setupApp() {
  todos = getTodosFromLS();

  renderTodos(todos);
  renderLightMode();
}

// Event Listeners
form.addEventListener("submit", addNewTodo);
filtersWrapper.addEventListener("click", filterTodos);
clearBtn.addEventListener("click", clearCompletedTodos);
toggleBtnsWrapper.addEventListener("click", toggleLightAndDarkMode);
document.addEventListener("DOMContentLoaded", setupApp);
