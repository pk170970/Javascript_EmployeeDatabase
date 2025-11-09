import "./styles.css";

(async function () {
  const headerBtn = document.querySelector(".header-btn");
  const employeeList = document.querySelector(".employee-list");
  const employeeDataSingle = document.querySelector(".employee-info-single");
  const employeeModal = document.querySelector(".employee-modal");
  const form = document.querySelector(".employee-modal-form");
  const dobInput = document.querySelector(".employee-dob");
  const defaultEmployeeImageUrl =
    "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

  const response = await fetch("../src/data.json");
  const data = await response.json();
  let employeeData = data;
  let selectedEmployeeId = employeeData[0].id;
  let selectedEmployee = employeeData[0];

  employeeModal.addEventListener("click", (e) => {
    if (e.target.className === "employee-modal") {
      employeeModal.hidden = true;
    }
  });

  headerBtn.addEventListener("click", () => {
    employeeModal.hidden = false;
  });

  const startYear = `${new Date().getFullYear() - 18}`; //Current year - 18
  const startMonthAndDate = `${new Date().toISOString().slice(5, 10)}`; // "2025-11-09T07:46:21.561Z" is we get from toISOString() then slice(5,10) returns 11-09
  dobInput.max = `${startYear}-${startMonthAndDate}`;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const formEntries = [...formData.entries()];
    const objData = Object.fromEntries(formEntries);

    if (form.dataset.editId) {
      const id = parseInt(form.dataset.editId, 10);
      const index = employeeData.findIndex((data) => data.id === id);
      if (index > -1) {
        employeeData[index] = { ...employeeData[index], ...objData, id };
      }
      delete form.dataset.editingId; // clear edit state
    } else {
      objData["id"] = employeeData[employeeData.length - 1].id + 1;
      objData.age =
        new Date().getFullYear() - parseInt(objData.dob.slice(0, 4), 10);
      objData.imageUrl = objData.imageUrl || defaultEmployeeImageUrl;

      employeeData.push(objData);
    }

    renderEmployees();
    form.reset();
    employeeModal.hidden = true;
  });

  employeeList.addEventListener("click", (event) => {
    //Add class on selected Item and show data
    const clickedItem = event.target.closest(".employee-list-item");
    if (!clickedItem) return;

    const deleteItem = event.target.closest(".delete");
    const editItem = event.target.closest(".edit");
    const id = parseInt(clickedItem.id, 10);

    if (deleteItem) {
      event.stopPropagation();

      employeeData = employeeData.filter((data) => data.id !== id);
      selectedEmployeeId = employeeData.length > 0 ? employeeData[0].id : -1;
      selectedEmployee = employeeData[0];
      renderEmployees();
      renderSingleEmployee();
      return;
    }

    if (editItem) {
      event.stopPropagation();
      const editData = employeeData.filter((data) => data.id == id);
      if (!editData) return;
      openEditModal(editData[0]);
      return;
    }

    //Select item
    selectedEmployeeId = clickedItem.id;
    renderEmployees();
    renderSingleEmployee();
  });

  const renderEmployees = () => {
    console.log(selectedEmployeeId);
    employeeList.innerHTML = "";

    employeeData.forEach((emp) => {
      const employeeListItem = document.createElement("div");
      employeeListItem.classList.add("employee-list-item");
      employeeListItem.setAttribute("id", emp.id);

      if (parseInt(selectedEmployeeId, 10) === emp.id) {
        employeeListItem.classList.add("selected");
        selectedEmployee = emp;
      }

      const userName = document.createElement("span");
      userName.innerHTML = `${emp.firstName} ${emp.lastName}`;
      employeeListItem.append(userName);

      const editText = document.createElement("span");
      editText.classList.add("edit");
      editText.innerHTML = "✏️";

      employeeListItem.append(editText);

      const deleteText = document.createElement("span");
      deleteText.classList.add("delete");
      deleteText.innerHTML = "🗑️";
      employeeListItem.append(deleteText);

      if (employeeList) {
        employeeList.append(employeeListItem);
      }
    });
  };

  const renderSingleEmployee = () => {
    if (selectedEmployeeId === -1) {
      employeeDataSingle.innerHTML = "";
      return;
    }

    employeeDataSingle.innerHTML = `
    <img src="${selectedEmployee.imageUrl}" alt="user image">
    <p>${selectedEmployee.firstName} ${selectedEmployee.lastName}</p>
    <p>${selectedEmployee.email}</p>
    <p>Mobile - ${selectedEmployee.contactNumber}</p>
    <p>DOB - ${selectedEmployee.dob}</p>
    `;
  };

  const openEditModal = (data) => {
    console.log("data is", data);
    employeeModal.hidden = false;
    form.firstName.value = data.firstName;
    form.lastName.value = data.lastName;
    form.email.value = data.email;
    form.address.value = data.address;
    form.elements["salary"].value = data.salary;
    form.elements["contactNumber"].value = data.contactNumber;
    form.imageUrl.value = data.imageUrl || defaultEmployeeImageUrl;

    const [day, month, year] = data.dob.split("/");
    form.dob.value = `${year}-${month}-${day}`;

    form.dataset.editId = data.id;
  };

  renderEmployees(employeeData);
  renderSingleEmployee();
})();
