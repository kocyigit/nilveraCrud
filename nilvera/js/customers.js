async function loadCustomers(page = 1) {
  var searchText = document.getElementById("searchInputCustomers").value;
  let response;
  let customersData = [];

  try {
    if (searchText) {
      response = await api.get(`/Customers/Search/${searchText}`);
      customersData = Array.isArray(response.data) ? response.data : [];
    } else {
      response = await api.get(`/Customers?page=${page}`);
      customersData = Array.isArray(response.data.Content)
        ? response.data.Content
        : [];
    }

    const totalPages = response.data.TotalPages;
    const currentPage = page;

    const customersContent = document.getElementById("customers-content");
    customersContent.innerHTML = "";

    if (customersData.length === 0) {
      customersContent.innerHTML =
        '<tr><td colspan="9">Hiç Müşteri bulunamadı.</td></tr>';
    }

    customersData.forEach((customers) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td></td>
                <td>${customers.Name}</td>
                <td class="text-center">${customers.TaxNumber}</td>
                <td class="text-center">${customers.TaxDepartment}</td>
                <td class="text-center">${customers.Address}</td>
                <td class="text-center">${customers.City} - ${customers.District}</td>
         
                <td class="text-center">
                  <div class="dropdown">
                    <i class="fa-solid fa-list cursor-pointer" onclick="toggleDropdown(this)"></i>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                      <button class="dropdown-item" onclick="deleteCustomer(${customers.ID})">
                          <div><i style="font-size:13px;color:red" class="fa-solid fa-trash"></i> <span>Sil</span></div>
                      </button>
                      <button class="dropdown-item" onclick="updateCustomer(${customers.TaxNumber},${customers.ID})">
                          <div><i style="font-size:13px;color:blue" class="fa-solid fa-edit"></i> <span>Düzenle</span></div>
                      </button>
                  </div>
              </div>
          </td>
            `;
      customersContent.appendChild(row);
    });

    updatePaginationCustomers(totalPages, currentPage);
  } catch (error) {
    console.error("Müşteriler yüklenirken hata oluştu:", error);
    document.getElementById("stocks-content").innerHTML =
      '<tr><td colspan="9">Veri yüklenirken bir hata oluştu.</td></tr>';
  }
}

function handleAddCustomer() {
  const customer = {
    Name: document.getElementById("name").value,
    TaxNumber: document.getElementById("taxNumber").value,
    TaxDepartment: document.getElementById("taxDepartment").value,
    Address: document.getElementById("address").value,
    Country: document.getElementById("country").value,
    City: document.getElementById("city").value,
    District: document.getElementById("district").value,
    PostalCode: document.getElementById("postalCode").value,
    Phone: document.getElementById("phone").value,
    Fax: document.getElementById("fax").value,
    Email: document.getElementById("email").value,
    WebSite: document.getElementById("webSite").value,
    IsExport: document.getElementById("isExport").checked,
  };

  addCustomer(customer);
}

async function addCustomer(customer) {
  try {
    const response = await api.post("/customers", [customer]);

    const modalElement = document.getElementById("exampleModalCustomers");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    loadCustomers();
    showToast(response.data);
  } catch (error) {
    console.error("Müşteri eklenirken hata oluştu:", error);
  }
}

async function updateCustomer(taxNumber, customerId) {
  try {
    const response = await api.get(`/customers/getCustomerInfo/${taxNumber}`);
    const customer = response.data;

    document.getElementById("name").value = customer.Name || "";
    document.getElementById("taxNumber").value = customer.TaxNumber || "";
    document.getElementById("taxDepartment").value =
      customer.TaxDepartment || "";
    document.getElementById("address").value = customer.Address || "";
    document.getElementById("country").value = customer.Country || "";
    document.getElementById("city").value = customer.City || "";
    document.getElementById("district").value = customer.District || "";
    document.getElementById("postalCode").value = customer.PostalCode || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("fax").value = customer.Fax || "";
    document.getElementById("email").value = customer.Email || "";
    document.getElementById("webSite").value = customer.WebSite || "";
    document.getElementById("isExport").checked = customer.IsExport || false;

    openModalCustomers(true, customerId);
  } catch (error) {
    console.error("Müşteri verileri alınırken hata oluştu:", error);
  }
}

async function handleUpdateCustomer(customerId) {
  const updatedCustomer = {
    TaxNumber: document.getElementById("taxNumber").value,
    Name: document.getElementById("name").value,
    TaxDepartment: document.getElementById("taxDepartment").value,
    Address: document.getElementById("address").value,
    IsExport: document.getElementById("isExport").checked,
    Country: document.getElementById("country").value,
    City: document.getElementById("city").value,
    District: document.getElementById("district").value,
    PostalCode: document.getElementById("postalCode").value,
    Phone: document.getElementById("phone").value,
    Fax: document.getElementById("fax").value,
    Email: document.getElementById("email").value,
    WebSite: document.getElementById("webSite").value,

    ID: customerId,
  };

  try {
    const response = await api.put(`/customers/`, updatedCustomer);
    const modalElement = document.getElementById("exampleModalCustomers");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    loadCustomers();

    showToast(response.data);
  } catch (error) {
    console.error("Müşteri güncellenirken hata oluştu:", error);
  }
}

let isEditMode = false;
let customerId;

function openModalCustomers(editMode = false, customerIdToUpdate = null) {
  isEditMode = editMode;
  customerId = customerIdToUpdate;

  const actionButton = document.getElementById("btnSaveOrUpdate");

  if (isEditMode) {
    actionButton.innerHTML =
      '<i class="fa-solid fa-circle-plus"></i> Müşteri Güncelle';
    actionButton.onclick = () => handleUpdateCustomer(customerId);
  } else {
    actionButton.innerHTML =
      '<i class="fa-solid fa-circle-plus"></i> Müşteri Ekle';
    actionButton.onclick = handleAddCustomer;
  }

  const modal = new bootstrap.Modal(
    document.getElementById("exampleModalCustomers")
  );
  modal.show();
}

async function deleteCustomer(customerId) {
  try {
    const response = await api.delete(`/customers/${customerId}`);

    loadCustomers();
    showToast(response.data);
  } catch (error) {
    console.error("Stok silinirken hata oluştu:", error);
  }
}

function updatePaginationCustomers(totalPages, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevPage = document.createElement("li");
  prevPage.classList.add("page-item");
  prevPage.classList.toggle("disabled", currentPage === 1);
  prevPage.innerHTML = `<a class="page-prev" href="#"  onclick="loadCustomers(${
    currentPage - 1
  })"><i class="fa-solid fa-circle-chevron-left"></i></a>`;
  pagination.appendChild(prevPage);

  const maxPagesToShow = 5;
  const halfPagesToShow = Math.floor(maxPagesToShow / 2);
  let startPage = Math.max(1, currentPage - halfPagesToShow);
  let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("page-item");
    if (i === currentPage) pageItem.classList.add("active");
    pageItem.innerHTML = `<a class="page-link" href="#" onclick="loadCustomers(${i})">${i}</a>`;
    pagination.appendChild(pageItem);
  }

  const nextPage = document.createElement("li");
  nextPage.classList.add("page-item");
  nextPage.classList.toggle("disabled", currentPage === totalPages);
  nextPage.innerHTML = `<a class="page-prev"  onclick="loadCustomers(${
    currentPage + 1
  })"><i class="fa-solid fa-circle-chevron-right"></i></a>`;
  pagination.appendChild(nextPage);
}
