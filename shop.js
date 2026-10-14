// ===== SHOP.JS - ALL NFC CARDS CATALOG PAGE =====
let catalogCat = "all";
let catalogSort = "rel";
let catalogSearchQuery = "";
let viewMode = localStorage.getItem("tns_catalog_view") || "list"; // Default to list view as requested

const catalogContainer = $("#catalog-container");
const catalogCountEl = $("#catalog-count");
const searchInput = $("#catalog-search");
const searchClearBtn = $("#search-clear");
const sortSelect = $("#catalog-sort");
const btnViewGrid = $("#view-grid");
const btnViewList = $("#view-list");
const chipsContainer = $("#catalog-chips");

// Category definitions with rich labels
const CATALOG_CATS = {
  all: "All Cards",
  d: "Doctors",
  c: "CA & Finance",
  l: "Lawyers",
  r: "Google Review",
  s: "Creators & Social",
  o: "Business & Executive"
};

// Render category filter chips
if (chipsContainer) {
  chipsContainer.innerHTML = Object.entries(CATALOG_CATS).map(([k, v]) => {
    const count = k === "all" ? P.length : P.filter(p => p.t === k).length;
    return `<button class="chip-b ${k === catalogCat ? "on" : ""}" data-k="${k}">
      ${v} <span class="badge-num" style="opacity:.65;font-size:.78rem;margin-left:.25rem">(${count})</span>
    </button>`;
  }).join("");
}

// Set View Mode
function setViewMode(mode) {
  viewMode = mode;
  localStorage.setItem("tns_catalog_view", mode);
  if (btnViewGrid && btnViewList) {
    btnViewGrid.classList.toggle("active", mode === "grid");
    btnViewList.classList.toggle("active", mode === "list");
  }
  renderCatalog();
}

if (btnViewGrid) btnViewGrid.onclick = () => setViewMode("grid");
if (btnViewList) btnViewList.onclick = () => setViewMode("list");

// Category click
if (chipsContainer) {
  chipsContainer.onclick = e => {
    const btn = e.target.closest(".chip-b");
    if (!btn) return;
    catalogCat = btn.dataset.k;
    document.querySelectorAll("#catalog-chips .chip-b").forEach(b => b.classList.toggle("on", b === btn));
    renderCatalog();
  };
}

// Search input live filtering
if (searchInput) {
  searchInput.oninput = e => {
    catalogSearchQuery = e.target.value.trim().toLowerCase();
    if (searchClearBtn) searchClearBtn.style.display = catalogSearchQuery ? "block" : "none";
    renderCatalog();
  };
}
if (searchClearBtn) {
  searchClearBtn.onclick = () => {
    if (searchInput) searchInput.value = "";
    catalogSearchQuery = "";
    searchClearBtn.style.display = "none";
    renderCatalog();
  };
}

// Sort change
if (sortSelect) {
  sortSelect.onchange = e => {
    catalogSort = e.target.value;
    renderCatalog();
  };
}

// Render the Catalog
function renderCatalog() {
  if (!catalogContainer) return;

  // Filter by category
  let list = P.filter(p => catalogCat === "all" || p.t === catalogCat);

  // Filter by search query
  if (catalogSearchQuery) {
    list = list.filter(p => 
      p.n.toLowerCase().includes(catalogSearchQuery) ||
      TAG[p.t].toLowerCase().includes(catalogSearchQuery) ||
      (p.mat && p.mat.toLowerCase().includes(catalogSearchQuery))
    );
  }

  // Sort
  const sortFns = {
    rel: (a, b) => a.i - b.i,
    best: (a, b) => b.off - a.off,
    az: (a, b) => a.n.localeCompare(b.n),
    za: (a, b) => b.n.localeCompare(a.n),
    pl: (a, b) => a.p - b.p,
    ph: (a, b) => b.p - a.p
  };
  list = [...list].sort(sortFns[catalogSort] || sortFns.rel);

  // Update count badge
  if (catalogCountEl) {
    catalogCountEl.textContent = `Showing ${list.length} Product${list.length === 1 ? "" : "s"}`;
  }

  // Handle empty search
  if (list.length === 0) {
    catalogContainer.innerHTML = `
      <div class="text-center py-5 w-100">
        <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
        <h3 class="h4">No matching NFC cards found</h3>
        <p class="text-muted">Try clearing your search or switching categories to see all products.</p>
        <button class="btn btn-g mt-2" onclick="clearFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  if (viewMode === "list") {
    // RENDER LIST VIEW (Enhanced rich list rows)
    catalogContainer.className = "product-list-view";
    catalogContainer.innerHTML = list.map((p, k) => `
      <article class="pc-list" data-i="${p.i}">
        <div class="pc-list-thumb">
          ${p.off ? `<span class="badge-off">Sale · ${p.off}% off</span>` : ""}
          <img src="${p.img}" class="pc-list-thumb-img" alt="${p.n}" loading="lazy">
        </div>
        <div class="pc-list-info">
          <div class="pc-list-header">
            <span class="tag">${TAG[p.t]}</span>
            <span class="badge-mat badge-mat-${p.mat === "Metal" ? "metal" : p.mat === "Wood" ? "wood" : p.mat === "Standee" ? "standee" : "pvc"}">${p.mat || "TNS NFC"}</span>
            <span class="pc-list-rating ms-auto">★ ${p.rating} <span>(${p.reviews} reviews)</span></span>
          </div>
          <h3>${p.n}</h3>
          <ul class="pc-list-bullets">
            <li><svg class="i"><use href="#i-check2"/></svg> Contactless tap for iOS & Android</li>
            <li><svg class="i"><use href="#i-check2"/></svg> Embedded NTAG215 Fast Chip</li>
            <li><svg class="i"><use href="#i-check2"/></svg> Dual NFC + QR profile backup</li>
            <li><svg class="i"><use href="#i-check2"/></svg> Zero monthly fees or subscription</li>
          </ul>
        </div>
        <div class="pc-list-pricing">
          <div class="pc-list-price">
            <b>${inr(p.p)}</b>
            ${p.m ? `<s>${inr(p.m)}</s>` : ""}
          </div>
          ${p.m ? `<span class="pc-list-save">Save ${inr(p.m - p.p)} (${p.off}%)</span>` : ""}
          <span class="pc-list-stock">● In Stock · Ships in 24h</span>
          <div class="pc-list-actions">
            <button class="btn-specs" data-specs="${p.i}" title="View details & chip specs">Specs</button>
            <button class="btn btn-g add-catalog-btn" data-i="${p.i}">
              <svg class="i"><use href="#i-bag-plus"/></svg> Add
            </button>
          </div>
        </div>
      </article>
    `).join("");
  } else {
    // RENDER GRID VIEW (Dense 4-column 3D grid)
    catalogContainer.className = "row g-4 product-grid-view";
    catalogContainer.innerHTML = list.map((p, k) => `
      <div class="col-sm-6 col-lg-4 col-xl-3">
        <article class="pc h-100">
          <div class="pv">
            ${p.off ? `<span class="off">Sale · ${p.off}% off</span>` : ""}
            <span class="wt">${p.w || p.mat}</span>
            <img src="${p.img}" class="pv-img" alt="${p.n}" loading="lazy">
          </div>
          <div class="pb">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="tag">${TAG[p.t]}</span>
              <span class="badge-mat badge-mat-${p.mat === "Metal" ? "metal" : p.mat === "Wood" ? "wood" : p.mat === "Standee" ? "standee" : "pvc"}">${p.mat || "TNS"}</span>
            </div>
            <h3>${p.n}</h3>
            <div class="price">
              <b>${inr(p.p)}</b>
              ${p.m ? `<s>${inr(p.m)}</s>` : `<small>From</small>`}
            </div>
            ${p.m ? `<span class="save">You save ${inr(p.m - p.p)}</span>` : ""}
            <div class="d-flex gap-2 mt-auto">
              <button class="btn-specs flex-grow-1" data-specs="${p.i}">Specs</button>
              <button class="add add-catalog-btn flex-grow-1" data-i="${p.i}">
                <svg class="i"><use href="#i-bag-plus"/></svg> Add
              </button>
            </div>
          </div>
        </article>
      </div>
    `).join("");
  }

  bindCatalogActions();
}

function clearFilters() {
  catalogCat = "all";
  catalogSearchQuery = "";
  if (searchInput) searchInput.value = "";
  if (searchClearBtn) searchClearBtn.style.display = "none";
  document.querySelectorAll("#catalog-chips .chip-b").forEach((b, i) => b.classList.toggle("on", i === 0));
  renderCatalog();
}

// Bind Add to Cart and Quick Specs modal
function bindCatalogActions() {
  // Add to cart buttons
  document.querySelectorAll(".add-catalog-btn").forEach(btn => {
    btn.onclick = e => {
      const idx = e.currentTarget.dataset.i;
      const product = P[idx];
      if (product) {
        cart.push(product);
        drawCart();
        btn.classList.add("btn-success");
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="i"><use href="#i-check2"/></svg> Added!`;
        setTimeout(() => {
          btn.classList.remove("btn-success");
          btn.innerHTML = originalText;
        }, 1200);
      }
    };
  });

  // Specs modal trigger
  document.querySelectorAll(".btn-specs").forEach(btn => {
    btn.onclick = e => {
      const idx = e.currentTarget.dataset.specs;
      openSpecsModal(P[idx]);
    };
  });
}

// Open Quick Specs Modal
function openSpecsModal(p) {
  if (!p) return;
  const modalEl = document.getElementById("quickSpecsModal");
  if (!modalEl) return;

  $("#modalCardTitle").textContent = p.n;
  $("#modalPrice").innerHTML = `<b>${inr(p.p)}</b> ${p.m ? `<s>${inr(p.m)}</s>` : ""}`;
  $("#modalBadge").textContent = TAG[p.t];
  const mDisp = $("#modalDisplay");
  if (mDisp) {
    mDisp.innerHTML = `<img src="${p.img}" class="img-fluid rounded-4 shadow object-fit-cover w-100" style="aspect-ratio:1.45" alt="${p.n}">`;
  }

  // Specs Table
  $("#specMat").textContent = p.mat || "High-Grade PVC";
  $("#specChip").textContent = SPECS.chip;
  $("#specFreq").textContent = SPECS.freq;
  $("#specDistance").textContent = SPECS.distance;
  $("#specRetention").textContent = SPECS.retention;
  $("#specCompat").textContent = SPECS.compat;

  // Add to Cart inside modal
  const modalAddBtn = $("#modalAddToCart");
  if (modalAddBtn) {
    modalAddBtn.onclick = () => {
      cart.push(p);
      drawCart();
      modalAddBtn.innerHTML = `<svg class="i"><use href="#i-check2"/></svg> Added to Order!`;
      setTimeout(() => {
        modalAddBtn.innerHTML = `<svg class="i"><use href="#i-bag-plus"/></svg> Add to Cart`;
      }, 1300);
    };
  }

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

// Draw Cart drawer
function drawCart() {
  saveCart();
  const countEl = $("#cnt");
  if (countEl) countEl.textContent = cart.length;
  const ci = $("#ci");
  if (ci) {
    ci.innerHTML = cart.length ? cart.map((p, k) => `
      <div class="ci">
        <div class="ci-info">
          <span class="ci-title font-monospace" style="font-size:.9rem;font-weight:600">${p.n}</span>
          <small class="text-muted d-block">${inr(p.p)}</small>
        </div>
        <button data-k="${k}" class="btn-remove" aria-label="Remove item" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:.4rem">
          <svg class="i"><use href="#i-trash"/></svg>
        </button>
      </div>
    `).join("") : '<p class="text-muted text-center py-5">You have no items in your cart.</p>';
  }
  const ct = $("#ct");
  if (ct) {
    const total = cart.reduce((a, p) => a + (p.p || 0), 0);
    ct.innerHTML = cart.length ? `<span>Subtotal</span><b class="text-dark">${inr(total)}</b>` : "";
  }
}

// Remove from cart
const cartContainer = $("#ci");
if (cartContainer) {
  cartContainer.onclick = e => {
    const btn = e.target.closest("button");
    if (btn && btn.dataset.k !== undefined) {
      cart.splice(btn.dataset.k, 1);
      drawCart();
    }
  };
}

// Initial Run
drawCart();
renderCatalog();
