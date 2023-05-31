const productContainer = document.querySelector('.first-page-right-middle-component');
const filterOptionsContainer = document.querySelector('.first-page-left-middle-component');
let product_type_id = ""
let category_merk_id = ""
let category_id = ""
let page = "1"
let limit = "8"

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const image = document.createElement('img');
    image.src = product.image ? product.image : "/assets/pexels-photo-1464625.jpeg";
    image.alt = 'Product Image';
    card.appendChild(image);

    const name = document.createElement('h3');
    name.textContent = product.name ? product.name : "Product Name";
    card.appendChild(name);

    const description = document.createElement('p');
    description.textContent = product.description ? product.description : "Product Description";
    card.appendChild(description);

    const stock = document.createElement('p');
    stock.textContent = product.stock ? product.stock : "Product Stock";
    card.appendChild(stock);

    card.addEventListener('click', () => {
        // Handle card click, navigate to the second page
        window.location.href = `/components/second_page_component.html?product=${product.id}`;
    });

    productContainer.appendChild(card);
}


function displayProducts(products) {
    if (productContainer.childElementCount > 0) {
        productContainer.innerHTML = ""
    }
    for (let i = 0; i < products.length; i++) {
        createProductCard(products[i])
    }
}

async function createFilterOptions(filters) {
    try {

        // Loop through the filters
        for (let filter in filters) {
            // Create the filter option element
            const filterOption = document.createElement('div');
            filterOption.classList.add('filter-option');

            // Create the filter title element
            const filterTitle = document.createElement('h4');
            filterTitle.classList.add('filter-title');
            filterTitle.textContent = filters[filter].label;
            var customKey = filters[filter].key;
            filterTitle.setAttribute("key", customKey);
            filterOption.appendChild(filterTitle);

            // Create the checkboxes container
            const checkboxesContainer = document.createElement('div');
            checkboxesContainer.classList.add('checkboxes');

            // Loop through the filter options
            for (const option of filters[filter].data) {
                // Create the checkbox element
                const checkbox = document.createElement('div');
                checkbox.classList.add('form-check');

                const checkboxInput = document.createElement('input');
                checkboxInput.classList.add('form-check-input');
                checkboxInput.type = 'checkbox';
                checkboxInput.value = option.id;
                checkbox.appendChild(checkboxInput);

                const checkboxLabel = document.createElement('label');
                checkboxLabel.classList.add('form-check-label');
                checkboxLabel.textContent = option.name;
                checkbox.appendChild(checkboxLabel);

                checkboxesContainer.appendChild(checkbox);
            }

            filterOption.appendChild(checkboxesContainer);
            filterOptionsContainer.appendChild(filterOption);
        }
    } catch (error) {
        console.error('Error fetching filters:', error);
    }
}

async function getFilters() {
    try {
        const { categoryMerk } = await fetchCategoryMerk()
        const { productType } = await fetchProductType()
        const { tCategory } = await fetchTCategory()
        return {
            brand_categories: {
                label: "Brand Categories",
                key: "category_merk_ids",
                data: categoryMerk
            },
            product_types: {
                label: "Product Type",
                key: "product_type_ids",
                data: productType
            },
            categories: {
                label: "Categories",
                key: "category_ids",
                data: tCategory
            },
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            brand_categories: [],
            product_types: [],
            categories: [],
            error
        };
    }
}

function handleApplyFilter() {
    var checkboxes = document.querySelectorAll("input[type='checkbox']");
    var groupedValues = {};

    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            var greatGrandparentElement = checkbox.parentNode.parentNode.parentElement;
            var filterTitleElement = greatGrandparentElement.querySelector('.filter-title');
            var keyAttribute = filterTitleElement.getAttribute("key");
            console.log(keyAttribute)
            var checkboxValue = checkbox.value;
            var existingKey = groupedValues[keyAttribute];

            // Concatenate the existing key with the checkbox value
            var updatedKey = existingKey ? existingKey + ',' + checkboxValue : checkboxValue;

            // Update the groupedValues object with the updated key
            groupedValues[keyAttribute] = updatedKey;
        }
    });
    const product_type_ids = groupedValues["product_type_ids"] ? groupedValues["product_type_ids"] : ""
    const category_merk_ids = groupedValues["category_merk_ids"] ? groupedValues["category_merk_ids"] : ""
    const category_ids = groupedValues["category_ids"] ? groupedValues["category_ids"] : ""
    fetchProducts(page, limit, product_type_ids, category_merk_ids, category_ids)
        .then(({ products, totalPages }) => {
            displayProducts(products)
        })
}

function handlePreviousClick() {
    // Handle previous button click event
    // Add your code here
}

function handleNextClick() {
    // Handle next button click event
    // Add your code here
}

document.addEventListener('DOMContentLoaded', function () {
    // Retrieve the product ID from the URL query parameters
    console.log(window.location.pathname)
    if (window.location.pathname === '/index.html') {
        fetchProducts(page, limit, product_type_id, category_merk_id, category_id)
            .then(({ products, totalPages }) => {
                console.log(products)
                displayProducts(products)
            })

        getFilters()
            .then((data) => {
                createFilterOptions(data)
            })

        var applyButton = document.querySelector(".apply-btn");
        applyButton.addEventListener("click", handleApplyFilter);

        const previousBtn = document.querySelector('.previous-btn');
        previousBtn.addEventListener('click', handlePreviousClick);

        const nextBtn = document.querySelector('.next-btn');
        nextBtn.addEventListener('click', handleNextClick);


    }

    if (window.location.pathname === '/components/second_page_component.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');

        // Function to fetch product details based on ID
        async function fetchProductDetails(productId) {
            fetchProductByID(productId)
                .then((product) => {
                    document.getElementById('productImage').src = product.image ? product.image : "/assets/pexels-photo-1464625.jpeg";
                    document.getElementById('productName').textContent = product.name;
                    document.getElementById('productDescription').textContent = product.description;
                    document.getElementById('productStock').textContent = product.stock;
                })
        }

        // Call the fetchProductDetails function with the product ID
        fetchProductDetails(productId);
    }
})

const baseURL = "http://localhost:3000"
async function fetchProducts(page, limit, product_type_ids, category_merk_ids, category_ids) {
    try {
        const url = `${baseURL}/products?page=${page}&limit=${limit}&product_type_ids=${product_type_ids}&category_merk_ids=${category_merk_ids}&category_ids=${category_ids}&timestamp=${Date.now}`;
        const response = await fetch(url);
        const data = await response.json();
        const products = data.data || [];
        const totalPages = data.totalPages || 0;
        return { products, totalPages };
    } catch (error) {
        console.error('Error fetching products:', error);
        return { products: [], totalPages: 0 };
    }
}

async function fetchProductByID(product_id) {
    try {
        const url = `${baseURL}/products/${product_id}?timestamp=${Date.now()}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching product by id:', error);
        return { products: [], totalPages: 0 };
    }
}

async function fetchCategoryMerk() {
    try {
        const url = `${baseURL}/category-merks`
        const response = await fetch(url);
        const data = await response.json();
        const categoryMerk = data.data || [];
        const totalPages = data.totalPages || 0;
        return { categoryMerk, totalPages };
    } catch (error) {
        console.error('Error fetching categoryMerk:', error);
        return { categoryMerk: [], totalPages: 0 };
    }
}

async function fetchProductType() {
    try {
        const url = `${baseURL}/product-types`
        const response = await fetch(url);
        const data = await response.json();
        const productType = data.data || [];
        const totalPages = data.totalPages || 0;
        return { productType, totalPages };
    } catch (error) {
        console.error('Error fetching productType:', error);
        return { productType: [], totalPages: 0 };
    }
}

async function fetchTCategory() {
    try {
        const url = `${baseURL}/t-categories`
        const response = await fetch(url);
        const data = await response.json();
        const tCategory = data.data || [];
        const totalPages = data.totalPages || 0;
        return { tCategory, totalPages };
    } catch (error) {
        console.error('Error fetching tCategory:', error);
        return { tCategory: [], totalPages: 0 };
    }
}

fetchCategoryMerk()
    .then(({ categoryMerk, totalPages }) => {
    })

fetchProductType()
    .then(({ productType, totalPages }) => {
    })

fetchTCategory()
    .then(({ tCategory, totalPages }) => {
    })