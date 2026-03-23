const JSON_PATH_PREFIX = "assets/jsons/";
let allProductsData = [];
let productsData = [];
let categories = [];

const F_NAME_REGEX = /^[A-ZŠĐŽĆČ][a-zšđžćč]{2,14}$/;
const L_NAME_REGEX = /^[A-ZŠĐŽĆČ][a-zšđžćč]{3,20}$/;
const ADDRESS_REGEX = /^[A-Za-zŠĐŽĆČšđžćč\s]{3,50}\s\d+[a-zA-Z]?$/;
const EMAIL_ADDRESS_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^(\+381|0)6\d{2}[\s\-]?\d{3}[\s\-]?\d{3,4}$/;

let visibleCount = 8;

async function fetchData(json) {
  try {
    const RESPONSE = await fetch(JSON_PATH_PREFIX + json);
    return await RESPONSE.json();
  } catch (error) {
    console.log(error);
  }
}

window.onload = function () {
  const PAGE = this.document.body.dataset.page;

  fetchData("menu.json").then((data) => {
    printMenu(data, PAGE);
  });

  switch (PAGE) {
    case "index":
      initIndexPage();
      break;
    case "shop":
      initShopPage();
      break;
    case "about":
      initAboutPage();
      break;
    case "services":
      initServicesPage();
      break;
    case "blog":
      initBlogPage();
      break;
    case "cart":
      initCartPage();
      break;
    case "checkout":
      initCheckOutPage();
      break;
    case "thankyou":
      initThankYouPage();
      break;
    case "author":
      break;
  }
};

function printMenu(dataArr, page) {
  let text = `<ul class="custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0">`;
  for (const dataElement of dataArr) {
    dataElement.route.includes(page)
      ? (text += `<li class="nav-item active">`)
      : (text += `<li>`);
    text += `<a class="nav-link" href="${dataElement.route}">${dataElement.title}</a></li>`;
  }
  text += `</ul>

			 <ul class="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5">
				<li><a class="nav-link" href="cart.html"><img src="assets/images/cart.svg"></a></li>
			 </ul>`;

  document.getElementById("navbarsFurni").innerHTML = text;
}

// FUNCTIONALITY FOR INDEX PAGE --------------------------------------------------------------------------------------------------------

function initIndexPage() {
  fetchData("products.json").then((data) => {
    printInitProducts(data);
  });

  fetchData("servicesIcons.json").then((data) => {
    printServicesIcons(data, "servicesIcons");
  });

  fetchData("products.json").then((data) => {
    printPopularProducts(data);
  });

  fetchData("blogs.json").then((data) => {
    printBlogs(data, "blogSection");
  });
}

function printPopularProducts(productsArr) {
  let popularProducts = document.getElementById("popularProducts");

  const TOP_3_BY_RATE = productsArr
    .map((product) => ({
      ...product,
      averageRating: calculateAverageRating(product),
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3);

  text = ``;
  TOP_3_BY_RATE.forEach((product) => {
    text += `<div class="col-12 col-md-6 col-lg-4 mb-4 mb-lg-0">
						<div class="product-item-sm d-flex">
							<div class="thumbnail">
								<img src="assets/images/${product.image.src}" alt="${product.image.alt}" class="img-fluid">
							</div>
							<div class="pt-3">
								<h3>${product.name}</h3>
								<p>Donec facilisis quam ut purus rutrum lobortis. Donec vitae odio </p>
								<p><a href="#">Read More</a></p>
							</div>
						</div>
					</div>`;
  });

  popularProducts.innerHTML = text;
}

function calculateAverageRating(product) {
  let votesNumber = 0;
  let totalScore = 0;

  product.rating.forEach((r) => {
    votesNumber += r.count;
    totalScore += r.count * r.value;
  });

  return votesNumber == 0 ? 0 : (totalScore / votesNumber).toFixed(1);
}

// END INDEX PAGE ----------------------------------------------------------------------------------------------------------------------

// FUNCTIONALITY FOR SHOP PAGE ---------------------------------------------------------------------------------------------------------

function initShopPage() {
  fetchData("products.json").then((data) => {
    allProductsData = data;
    productsData = [...allProductsData];
    printProducts();
  });

  fetchData("categories.json").then((data) => {
    categories = data;
    printDdl(categories, "roomFilter", "Choose room...");
  });

  fetchData("colors.json").then((data) => {
    printDdl(data, "colorFilter", "Choose color...");
  });

  let roomFilter = document.getElementById("roomFilter");

  roomFilter.addEventListener("change", function () {
    printDdl(categories, "categoriesFilter", "All categories");
    updateProducts();
  });

  let categoriesFilter = document.getElementById("categoriesFilter");
  categoriesFilter.addEventListener("change", updateProducts);

  let colorFilter = document.getElementById("colorFilter");
  colorFilter.addEventListener("change", updateProducts);

  let sort = document.getElementById("sort");
  sort.addEventListener("change", updateProducts);

  document
    .getElementById("productsSection")
    .addEventListener("click", function (e) {
      e.preventDefault();
      let id = e.target.closest(".icon-cross").dataset.id;
      let cart = getCart() || [];
      let p = cart.find((c) => c.id == id);
      if (p) {
        p.quantity++;
      } else {
        let newP = {
          id,
          quantity: 1,
        };
        cart.push(newP);
      }
      saveCart(cart);
      showToast("Item added successfully.");
    });

  document.getElementById("loadMoreBtn").addEventListener("click", function () {
    visibleCount += 8;
    printProducts();
    toogleLoadMoreButton();
  });
}

function printProducts() {
  console.log("visible:", visibleCount);
  console.log("total:", productsData.length);
  let productsSection = document.getElementById("productsSection");
  let productToTShow = productsData.slice(0, visibleCount);
  let text = ``;

  productToTShow.forEach((p) => {
    p.discount
      ? (text += `<div class="col-12 col-md-4 col-lg-3 mb-5">
						<a class="product-item" href="#">
							<img src="assets/images/${p.image.src}" alt="${p.image.alt}" class="img-fluid product-thumbnail">
							<h3 class="product-title">${p.name}</h3>
							<p>${calculateAverageRating(p)} <i class="fa-solid fa-star"></i></p>
							<p class="text-decoration-line-through">$${p.price}</p>
							<strong class="product-price">$${printPrice(p.price, p.discount)}</strong>

							<span class="icon-cross" data-id="${p.id}">
								<img src="assets/images/cross.svg" class="img-fluid">
							</span>
						</a>
					</div>`)
      : (text += `<div class="col-12 col-md-4 col-lg-3 mb-5">
						<a class="product-item" href="#">
							<img src="assets/images/${p.image.src}" alt="${p.image.alt}" class="img-fluid product-thumbnail">
							<h3 class="product-title">${p.name}</h3>
							<p>${calculateAverageRating(p)} <i class="fa-solid fa-star"></i></p>
							<strong class="product-price">$${printPrice(p.price, p.discount)}</strong>

							<span class="icon-cross" data-id="${p.id}">
								<img src="assets/images/cross.svg" class="img-fluid">
							</span>
						</a>
					</div>`);
  });

  productsSection.innerHTML = text;
  toogleLoadMoreButton();
}

function updateProducts() {
  visibleCount = 8;
  let categoryCondition = categoriesFilter.value;
  let colorCondition = colorFilter.value;
  let sortCondition = sort.value;

  if (categoryCondition == "all") {
    productsData = [...allProductsData];
    visibleCount = 8;
    printProducts();
    return;
  }
  let filtered = allProductsData.filter((p) => {
    let categoryMatch =
      p.categoryId == categoryCondition || categoryCondition == 0;
    let colorMatch =
      (Array.isArray(p.colorId)
        ? p.colorId.includes(Number(colorCondition))
        : p.colorId == colorCondition) || colorCondition == 0;

    return categoryMatch && colorMatch;
  });

  if (sortCondition != "default") {
    switch (sortCondition) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
    }
  }

  productsData = filtered;
  printProducts();
  toogleLoadMoreButton();
}

function showToast(message) {
  let toast = document.getElementById("toast");
  toast.innerText = message;

  toast.classList.add("toast-show");

  setTimeout(() => {
    toast.classList.remove("toast-show");
  }, 1000);
}

function toogleLoadMoreButton() {
  let btn = document.getElementById("loadMoreBtn");

  if (visibleCount >= productsData.length) {
    btn.classList.add("d-none");
  } else {
    btn.classList.remove("d-none");
  }
}

function printPrice(price, discount) {
  return discount ? price - (price / 100) * discount : price;
}

// END SHOP PAGE -----------------------------------------------------------------------------------------------------------------------

// FUNCTIONALITY FOR ABOUT PAGE --------------------------------------------------------------------------------------------------------

function initAboutPage() {
  fetchData("servicesIcons.json").then((data) => {
    printServicesIcons(data, "servicesSection");
  });

  fetchData("employees.json").then((data) => {
    printTeam(data);
  });
}

function printTeam(employeesArr) {
  let teamSection = document.getElementById("teamSection");

  let text = ``;

  employeesArr.forEach((e) => {
    text += `<div class="col-12 col-md-6 col-lg-3 mb-5 mb-md-0">
					<img src="assets/images/${e.image}" class="img-fluid mb-5">
					<h3 clas><a href="#"><span class="">${e.firstName}</span> ${e.lastName}</a></h3>
            		<span class="d-block position mb-4">${e.role.title},${e.role.description}</span>
            		<p>${e.description}.</p>
        			<p class="mb-0"><a href="#" class="more dark">Learn More <span class="icon-arrow_forward"></span></a></p>
				</div>`;
  });
  teamSection.innerHTML = text;
}

// END ABOUT PAGE -----------------------------------------------------------------------------------------------------------------------

// FUNCTIONALITY FOR SERVICES PAGE -------------------------------------------------------------------------------------------------------

function initServicesPage() {
  fetchData("servicesIcons.json").then((data) => {
    printServicesIcons(data, "services");
  });

  fetchData("products.json").then((data) => {
    printInitProducts(data);
  });
}

// END SERVICES PAGE --------------------------------------------------------------------------------------------------------------------

// FUNCTIONALITY BLOG PAGE --------------------------------------------------------------------------------------------------------------

function initBlogPage() {
  fetchData("blogs.json").then((data) => {
    printBlogs(data, "blog");
  });
}

// END BLOG PAGE ------------------------------------------------------------------------------------------------------------------------

// FUNCTIONALITY FOR CART PAGE ----------------------------------------------------------------------------------------------------------

async function initCartPage() {
  allProductsData = await fetchData("products.json");
  let cartDiv = document.getElementById("cart");
  renderCart(cartDiv);

  cartDiv.addEventListener("click", function (e) {
    let btn = e.target.closest(".btn");
    let id = btn.dataset.id;
    let cart = getCart();
    let prodcut = cart.find((c) => c.id == id);

    if (btn.classList.contains("decrease")) {
      prodcut.quantity--;
    } else if (btn.classList.contains("increase")) {
      prodcut.quantity++;
    } else {
      let newCart = cart.filter((c) => c.id != id);
      cart = newCart;
    }

    saveCart(cart);
    renderCart(cartDiv);
  });
}

function renderCart(cartDiv) {
  let cart = getCart() || [];
  let text = ``;
  let total = 0;
  if (cart.length == 0) {
    text += `<h2 class="text-center">There is no item in cart</h2>`;
  } else {
    text += `<div class="container">
              <div class="row mb-5">
                  <div class="site-blocks-table">
                    <table class="table">
                      <thead>
                        <tr>
                          <th class="product-thumbnail">Image</th>
                          <th class="product-name">Product</th>
                          <th class="product-price">Price</th>
                          <th class="product-quantity">Quantity</th>
                          <th class="product-total">Total</th>
                          <th class="product-remove">Remove</th>
                        </tr>
                      </thead>
                      <tbody>`;
    cart.forEach((c) => {
      let prodcut = allProductsData.find((p) => p.id == c.id);
      let minus = c.quantity <= 1 ? "disabled" : "";
      let plus = c.quantity >= 10 ? "disabled" : "";
      text += `<tr>
                            <td class="product-thumbnail">
                              <img src="assets/images/${prodcut.image.src}" alt="${prodcut.image.alt}" class="img-fluid">
                            </td>
                            <td class="product-name">
                              <h2 class="h5 text-black">${prodcut.name}</h2>
                            </td>
                            <td>$${prodcut.price}</td>
                            <td>
                              <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
                                <div class="input-group-prepend">
                                  <button class="btn btn-outline-black decrease" type="button" data-id="${prodcut.id}" ${minus}>&minus;</button>
                                </div>
                                <span class="fs-5">${c.quantity}</span>
                                <div class="input-group-append">
                                  <button class="btn btn-outline-black increase" type="button" data-id="${prodcut.id}" ${plus}>&plus;</button>
                                </div>
                              </div>
          
                            </td>
                            <td>$${c.quantity * prodcut.price}</td>
                            <td><button class="btn btn-black btn-sm" data-id="${prodcut.id}">X</button></td>
                          </tr>`;
      total += c.quantity * prodcut.price;
    });
    text += `
                      </tbody>
                    </table>
                  </div>
              </div>
        
              <div class="row">
                <div class="col-md-6">
                  <div class="row mb-5">
                    <div class="col-md-6">
                      <a href="shop.html" class="btn btn-outline-black btn-sm btn-block">Continue Shopping</a>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 pl-5">
                  <div class="row justify-content-end">
                    <div class="col-md-7">
                      <div class="row">
                        <div class="col-md-12 text-right border-bottom mb-5">
                          <h3 class="text-black h4 text-uppercase">Cart Totals</h3>
                        </div>
                      </div>
                      <div class="row mb-5">
                        <div class="col-md-6">
                          <span class="text-black">Total</span>
                        </div>
                        <div class="col-md-6 text-right">
                          <strong class="text-black">$${total}</strong>
                        </div>
                      </div>
        
                      <div class="row">
                        <div class="col-md-12">
                          <button class="btn btn-black btn-lg py-3 btn-block" onclick="window.location='checkout.html'">Proceed To Checkout</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
  }
  cartDiv.innerHTML = text;
}

// END CART PAGE ------------------------------------------------------------------------------------------------------------------------

// FUNCTIONALITY FOR CHECKOUT PAGE ------------------------------------------------------------------------------------------------------

async function initCheckOutPage() {
  allProductsData = await fetchData("products.json");

  fetchData("countries.json").then((data) => {
    printDdl(data, "c_country", "Select a country");
  });

  printCheckOutCart();

  document.getElementById("btnConfirm").addEventListener("click", function () {
    let c_country = document.getElementById("c_country");
    let c_fname = document.getElementById("c_fname");
    let c_lname = document.getElementById("c_lname");
    let c_address = document.getElementById("c_address");
    let c_email_address = document.getElementById("c_email_address");
    let c_phone = document.getElementById("c_phone");
    let termsOfPurchase = document.getElementById("termsOfPurchase");
    let errors = 0;

    if (c_country.value == 0) {
      c_country.classList.add("border", "border-danger");
      errors++;
    } else {
      c_country.classList.remove("border", "border-danger");
    }

    errors += checkInput(c_fname, F_NAME_REGEX, "First name is required.");
    errors += checkInput(c_lname, L_NAME_REGEX, "Last name is required.");
    errors += checkInput(c_address, ADDRESS_REGEX, "Address does not exist.");
    errors += checkInput(
      c_email_address,
      EMAIL_ADDRESS_REGEX,
      "Email is invalid.",
    );
    errors += checkInput(c_phone, PHONE_REGEX, "Phone is invalid.");

    if (!termsOfPurchase.checked) {
      termsOfPurchase.nextElementSibling.classList.remove("text-black");
      termsOfPurchase.nextElementSibling.classList.add("text-danger");
      errors++;
    } else {
      termsOfPurchase.nextElementSibling.classList.remove("text-danger");
      termsOfPurchase.nextElementSibling.classList.add("text-black");
    }
    if (errors == 0) {
      window.location.href = "thankyou.html";
    }
  });
}

function printCheckOutCart() {
  let checkOutTable = document.getElementById("checkOutTable");
  let cart = getCart() || [];
  let text = `<thead>
		                    <th>Product</th>
		                    <th>Total</th>
		                  </thead>
		                  <tbody>`;
  cart.forEach((c) => {
    let product = allProductsData.find((p) => p.id == c.id);
    text += `<tr>
		          <td>${product.name} <strong class="mx-2">x</strong> ${c.quantity}</td>
		          <td>$${product.price * c.quantity}</td>
		        </tr>`;
  });
  text += `</tbody>`;

  checkOutTable.innerHTML = text;
}

function checkInput(input, regex, text) {
  if (!regex.test(input.value)) {
    input.classList.add("border", "border-danger");
    input.nextElementSibling.innerHTML = `<p class='text-danger'>${text}</p>`;
    return 1;
  } else {
    input.classList.remove("border", "border-danger");
    input.nextElementSibling.innerHTML = ``;
    return 0;
  }
}

// END CHECKOUT PAGE --------------------------------------------------------------------------------------------------------------------

function initThankYouPage() {
  localStorage.clear();
}

// COMMON FUNCTIONS ---------------------------------------------------------------------------------------------------------------------

function printServicesIcons(iconsArr, div) {
  let divForPrint = document.getElementById(div);

  let text = ``;

  if (div == "services") {
    for (let i = 0; i < 2; i++) {
      for (iconObj of iconsArr) {
        text += `<div class="col-6 col-md-6 col-lg-3 mb-4">
						<div class="feature">
							<div class="icon">
								<img src="assets/images/${iconObj.image}" alt="${iconObj.title}" class="imf-fluid">
							</div>
							<h3>${iconObj.title}</h3>
							<p>Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet velit. Aliquam vulputate.</p>
						</div>
					</div>`;
      }
    }
  } else {
    for (iconObj of iconsArr) {
      text += `<div class="col-6 col-md-6">
						<div class="feature">
							<div class="icon">
								<img src="assets/images/${iconObj.image}" alt="${iconObj.title}" class="imf-fluid">
							</div>
							<h3>${iconObj.title}</h3>
							<p>Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet velit. Aliquam vulputate.</p>
						</div>
					</div>`;
    }
  }

  divForPrint.innerHTML = text;
}

function printBlogs(data, div) {
  let divToPrint = document.getElementById(div);

  let text = ``;

  if (div == "blog") {
    for (let i = 0; i < 3; i++) {
      data.forEach((b) => {
        text += `<div class="col-12 col-sm-6 col-md-4 mb-5">
						<div class="post-entry">
							<a href="blog.html" class="post-thumbnail"><img src="assets/images/${b.image}" alt="${b.title}" class="img-fluid"></a>
							<div class="post-content-entry">
								<h3>${b.title}</h3>
								<div class="meta">
									<span>by ${b.creator.firstName} ${b.creator.lastName}</span> <span>on ${formatDate(b.date)}</span>
								</div>
							</div>
						</div>
					</div>`;
      });
    }
  } else {
    data.forEach((b) => {
      text += `<div class="col-12 col-sm-6 col-md-4 mb-4 mb-md-0">
							<div class="post-entry">
								<a href="blog.html" class="post-thumbnail"><img src="assets/images/${b.image}" alt="${b.title}" class="img-fluid"></a>
								<div class="post-content-entry">
									<h3>${b.title}</h3>
									<div class="meta">
										<span>by ${b.creator.firstName} ${b.creator.lastName}</span> <span>on ${formatDate(b.date)}</span>
									</div>
								</div>
							</div>
						</div>`;
    });
  }

  divToPrint.innerHTML = text;
}

function formatDate(date) {
  let date1 = date.substr(0, 10);

  let dateObj = new Date(date1);
  let monthName = dateObj.toLocaleString("en-US", { month: "short" });
  let dateArr = date1.split("-");

  return monthName + " " + dateArr[2] + "," + dateArr[0];
}

function printDdl(data, div, label) {
  let text = `<option value="0">${label}</option>`;

  if (div == "roomFilter") {
    let rooms = data.filter((d) => d.parentId == null);

    text += `<option value="all">All</option>`;

    rooms.forEach((r) => {
      text += `<option value="${r.id}">${r.name}</option>`;
    });
  }

  if (div == "categoriesFilter") {
    let parentId = document.getElementById("roomFilter").value;

    let categories = data.filter((d) => {
      if (d.parentId == null) return false;
      if (parentId == "all") return true;
      return d.parentId == parentId;
    });
    text -= `<option value="all">All</option>`;
    categories.forEach((c) => {
      text += `<option value="${c.id}">${c.name}</option>`;
    });
  }

  if (div == "colorFilter" || div == "c_country") {
    data.forEach((c) => {
      text += `<option value="${c.id}">${c.name}</option>`;
    });
  }

  document.getElementById(div).innerHTML = text;
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart"));
}

function saveCart(value) {
  localStorage.setItem("cart", JSON.stringify(value));
}

function printInitProducts(productsArr) {
  let threeProducts = document.getElementById("threeProducts");

  text = `<div class="col-md-12 col-lg-3 mb-5 mb-lg-0">
					<h2 class="mb-4 section-title">Crafted with excellent material.</h2>
					<p class="mb-4">Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet velit. Aliquam vulputate velit imperdiet dolor tempor tristique. </p>
					<p><a href="shop.html" class="btn">Explore</a></p>
				</div> `;
  for (let i = 0; i < 3; i++) {
    text += `<div class="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
						<div class="product-item">
							<img src="assets/images/${productsArr[i].image.src}" alt=${productsArr[i].image.alt} class="img-fluid product-thumbnail">
							<h3 class="product-title">${productsArr[i].name}</h3>
							<strong class="product-price">$${productsArr[i].price}</strong>
						</div>
					</div> `;
  }

  threeProducts.innerHTML = text;
}

// END COMMON FUNCTIONS -----------------------------------------------------------------------------------------------------------------
