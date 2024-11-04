let currentPage = 1;
const pageSize = 10;

async function loadStocks(page = 1) {
  var searchText = document.getElementById("searchInput").value;
  let response;
  let stocksData = [];

  try {
    if (searchText) {
      response = await api.get(`/Stocks/SearchStock/${searchText}`);
      stocksData = Array.isArray(response.data) ? response.data : [];
    } else {
      response = await api.get(`/Stocks?page=${page}`);
      stocksData = Array.isArray(response.data.Content)
        ? response.data.Content
        : [];
    }

    const totalPages = response.data.TotalPages;
    const currentPage = page;

    const stocksContent = document.getElementById("stocks-content");
    stocksContent.innerHTML = "";

    if (stocksData.length === 0) {
      stocksContent.innerHTML =
        '<tr><td colspan="9">Hiç stok bulunamadı.</td></tr>';
    }

    stocksData.forEach((stock) => {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td></td>
              <td>${stock.Name}</td>
              <td class="text-center">${stock.SellerCode}</td>
              <td class="text-center">${stock.UnitName}</td>
              <td class="text-center">${stock.Price}</td>
              <td class="text-center">${stock.TaxPercent}</td>
              <td class="text-center">${
                stock.IsActive
                  ? '<i style="color:green" class="fa-solid fa-check"></i>'
                  : '<i style="color:red" class="fa-solid fa-x"></i>'
              }</td>
              <td class="text-center">${stock.CreatedDate}</td>
              <td class="text-center">
              <div class="dropdown">
                  <i class="fa-solid fa-list cursor-pointer" onclick="toggleDropdown(this)"></i>
                  <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                      <button class="dropdown-item" onclick="deleteStock(${
                        stock.ID
                      })">
                          <div><i style="font-size:13px;color:red" class="fa-solid fa-trash"></i> <span>Sil</span></div>
                      </button>
                      <button class="dropdown-item" onclick="updateStock(${
                        stock.ID
                      })">
                          <div><i style="font-size:13px;color:blue" class="fa-solid fa-edit"></i> <span>Düzenle</span></div>
                      </button>
                  </div>
              </div>
          </td>
          `;
      stocksContent.appendChild(row);
    });

    updatePagination(totalPages, currentPage);
  } catch (error) {
    console.error("Stoklar yüklenirken hata oluştu:", error);
    document.getElementById("stocks-content").innerHTML =
      '<tr><td colspan="9">Veri yüklenirken bir hata oluştu.</td></tr>';
  }
}

loadStocks(currentPage);

function handleAddStock() {
  const stock = {
    Name: document.getElementById("name").value,
    UnitCode: document.getElementById("unit").value,
    Price: parseFloat(document.getElementById("price").value),
    TaxPercent: parseInt(document.getElementById("taxPercent").value),
    IsActive: document.getElementById("isActive").checked,
    SellerCode: document.getElementById("sellerCode").value,
    BuyerCode: document.getElementById("buyerCode").value,
    ManufacturerCode: document.getElementById("manufacturerCode").value,
    Brand: document.getElementById("brand").value,
    Model: document.getElementById("model").value,
    Description: document.getElementById("description").value,
    Note: document.getElementById("note").value,
    GTIPCode: parseInt(document.getElementById("gtip").value),
    ShippingCode: document.getElementById("shippingCode").value,
    DeliveryCode: document.getElementById("deliveryCode").value,
  };

  addStock(stock);
}

async function addStock(stock) {
  try {
    const response = await api.post("/stocks", [stock]);

    const modalElement = document.getElementById("exampleModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    loadStocks();
    showToast(response.data);
  } catch (error) {
    console.error("Stok eklenirken hata oluştu:", error);
  }
}

async function updateStock(stockId) {
  try {
    const response = await api.get(`/stocks/${stockId}`);
    const stock = response.data;

    document.getElementById("name").value = stock.Name || "";
    document.getElementById("unit").value = stock.Unit || "";
    document.getElementById("price").value = stock.Price || "";
    document.getElementById("taxPercent").value = stock.TaxPercent || "0";
    document.getElementById("isActive").checked = stock.IsActive || false;
    document.getElementById("sellerCode").value = stock.SellerCode || "";
    document.getElementById("buyerCode").value = stock.BuyerCode || "";
    document.getElementById("manufacturerCode").value =
      stock.ManufacturerCode || "";
    document.getElementById("brand").value = stock.Brand || "";
    document.getElementById("model").value = stock.Model || "";
    document.getElementById("description").value = stock.Description || "";
    document.getElementById("note").value = stock.Note || "";
    document.getElementById("gtip").value = stock.GTIPCode || "";
    document.getElementById("shippingCode").value = stock.ShippingCode || "1";
    document.getElementById("deliveryCode").value = stock.DeliveryCode || "1";

    openModalStock(true, stockId);
  } catch (error) {
    console.error("Stok verileri alınırken hata oluştu:", error);
  }
}

async function handleUpdateStock(stockId) {
  const updatedStock = {
    Name: document.getElementById("name").value,
    UnitCode: document.getElementById("unit").value,
    Price: parseFloat(document.getElementById("price").value),
    TaxPercent: parseInt(document.getElementById("taxPercent").value),
    IsActive: document.getElementById("isActive").checked,
    SellerCode: document.getElementById("sellerCode").value,
    BuyerCode: document.getElementById("buyerCode").value,
    ManufacturerCode: document.getElementById("manufacturerCode").value,
    Brand: document.getElementById("brand").value,
    Model: document.getElementById("model").value,
    Description: document.getElementById("description").value,
    Note: document.getElementById("note").value,
    GTIPCode: document.getElementById("gtip").value,
    ShippingCode: document.getElementById("shippingCode").value,
    DeliveryCode: document.getElementById("deliveryCode").value,
    ID: stockId,
  };

  try {
    const response = await api.put(`/stocks/`, updatedStock);

    const modalElement = document.getElementById("exampleModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    loadStocks();

    showToast(response.data);
  } catch (error) {
    console.error("Stok güncellenirken hata oluştu:", error);
  }
}

let isEditMode = false;
let stockId;

function openModalStock(editMode = false, stockIdToUpdate = null) {
  isEditMode = editMode;
  stockId = stockIdToUpdate;

  const actionButton = document.getElementById("btnSaveOrUpdate");

  if (isEditMode) {
    actionButton.innerHTML =
      '<i class="fa-solid fa-circle-plus"></i> Stok Güncelle';
    actionButton.onclick = () => handleUpdateStock(stockId);
  } else {
    actionButton.innerHTML =
      '<i class="fa-solid fa-circle-plus"></i> Stok Ekle';
    actionButton.onclick = handleAddStock;
  }

  const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
  modal.show();
}

async function deleteStock(stockId) {
  try {
    const response = await api.delete(`/stocks/${stockId}`);

    loadStocks();
    showToast(response.data);
  } catch (error) {
    console.error("Stok silinirken hata oluştu:", error);
  }
}

function updatePagination(totalPages, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const prevPage = document.createElement("li");
  prevPage.classList.add("page-item");
  prevPage.classList.toggle("disabled", currentPage === 1);
  prevPage.innerHTML = `<a class="page-prev" href="#"  onclick="loadStocks(${
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
    pageItem.innerHTML = `<a class="page-link" href="#" onclick="loadStocks(${i})">${i}</a>`;
    pagination.appendChild(pageItem);
  }

  const nextPage = document.createElement("li");
  nextPage.classList.add("page-item");
  nextPage.classList.toggle("disabled", currentPage === totalPages);
  nextPage.innerHTML = `<a class="page-prev"  onclick="loadStocks(${
    currentPage + 1
  })"><i class="fa-solid fa-circle-chevron-right"></i></a>`;
  pagination.appendChild(nextPage);
}



