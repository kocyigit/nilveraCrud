const API_KEY =
  "7952AF3D95AA3BC39BBDBD28E8C165BF1E73E5DFD603845C2CC5119F79889887";
const BASE_URL = "https://apitest.nilvera.com/general";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

function showToast(message) {
  const toastElement = document.getElementById("successToast");
  const toastBody = toastElement.querySelector(".toast-body");
  toastBody.textContent = message;

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function toggleDropdown(iconElement) {
  const dropdownMenu = iconElement.nextElementSibling;
  dropdownMenu.classList.toggle("show");
}


