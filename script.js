// --- Configuración Global y API // ---
const API_URL = 'http://127.0.0.1:5000/api'; 

// ---Lógica Principal: Se ejecuta cuando el HTML está listo // ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variables y Selectores del DOM   // ---
    
    // Vistas (Páginas)
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const manageBrandsView = document.getElementById('manage-brands-view');
    const manageCategoriesView = document.getElementById('manage-categories-view');
    const manageSuppliersView = document.getElementById('manage-suppliers-view');
    const manageUsersView = document.getElementById('manage-users-view'); 

    // Objeto de Vistas
    const views = {
        'inventory-view': document.getElementById('inventory-view'),
        'add-product-view': document.getElementById('add-product-view'),
        'delete-product-view': document.getElementById('delete-product-view'),
        'manage-brands-view': manageBrandsView,
        'manage-categories-view': manageCategoriesView,
        'manage-suppliers-view': manageSuppliersView,
        'manage-users-view': manageUsersView 
    };
    
    // Formulario de Login
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loginErrorText = document.getElementById('login-error-text');
    const loginSubmitBtn = document.getElementById('login-submit-btn'); 
    
    // Usuario y Sesión
    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayRole = document.getElementById('user-display-role');
    const logoutBtn = document.getElementById('logout-btn');

    // Navegación (Sidebar)
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Formulario de Añadir Producto
    const addProductForm = document.getElementById('add-product-form');
    const addBrandSelect = document.getElementById('prod-brand');
    const addSupplierSelect = document.getElementById('prod-supplier');
    const addCategorySelect = document.getElementById('prod-category');
    const firstInput = document.getElementById('prod-name');
    
    // Vista de Inventario
    const inventoryTableBody = document.getElementById('inventory-table-body');
    const searchInput = document.getElementById('search-input');
    
    // Vista de Borrar Producto
    const deleteSearch = document.getElementById('delete-search');
    const deleteResultsList = document.getElementById('delete-results-list');
    
    // Vista de Administrar Marcas
    const addBrandForm = document.getElementById('add-brand-form');
    const brandsTableBody = document.getElementById('brands-table-body');
    
    // Vista de Administrar Categorías
    const addCategoryForm = document.getElementById('add-category-form');
    const categoriesTableBody = document.getElementById('categories-table-body');
    
    // Vista de Administrar Proveedores
    const addSupplierForm = document.getElementById('add-supplier-form');
    const suppliersTableBody = document.getElementById('suppliers-table-body');
    
    // Vista de Administrar Usuarios
    const addUserForm = document.getElementById('add-user-form');
    const usersTableBody = document.getElementById('users-table-body');
    const manageUsersLink = document.getElementById('manage-users-link');
    
    // Modal (para Editar y Ver Info)
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSaveButton = document.getElementById('modal-save-btn');
    const modalCancelButton = document.getElementById('modal-cancel-btn');
    const modalCloseButton = document.getElementById('modal-close-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const editProductForm = document.getElementById('edit-product-form');
    
    // Estado de la Aplicación (Caché local)
    let fullInventory = []; 
    let allBrands = [];
    let allSuppliers = [];
    let allCategories = [];
    let currentEditProductId = null;
    let currentUser = null;

    // ---
    // Funciones de Lógica
    // --- Funciones de Utilidad (UI) ---
       
    // Muestra el spinner de carga en un botón
    const showLoading = (button) => {
        if (!button) return;
        button.disabled = true;
        const btnText = button.querySelector('.btn-text');
        const loader = button.querySelector('.loader');
        const icon = button.querySelector('[data-lucide]');
    
        if (btnText) btnText.classList.add('hidden');
        if (icon) icon.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');
    };

    // Oculta el spinner de carga en un botón
    const hideLoading = (button) => {
        if (!button) return;
        button.disabled = false;
        const btnText = button.querySelector('.btn-text');
        const loader = button.querySelector('.loader');
        const icon = button.querySelector('[data-lucide]');
    
        if (btnText) btnText.classList.remove('hidden');
        if (icon) icon.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
    };

    // Mostrar toast temporal con mensaje
    const showToast = (message, durationMs = 4000) => {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toast-text');
        if (!toast || !toastText) return;
        toastText.textContent = message;
        toast.classList.remove('hidden');
        // Reinicializar iconos por si el toast se añadió dinámicamente
        lucide.createIcons();
        setTimeout(() => {
            toast.classList.add('hidden');
        }, durationMs);
    };

    // Formatea una fecha en formato fecha y hora legible en español
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '-';
            return new Intl.DateTimeFormat('es-ES', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/Guayaquil'
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };
            
    // 1. Lógica de Autenticación (Login)
    const handleLogin = async (e) => {
        e.preventDefault();
        showLoading(loginSubmitBtn); 
        loginError.classList.add('hidden');
        
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Usuario o contraseña incorrectos');
            }

            // ¡Éxito!
            localStorage.setItem('lubricadora_user', JSON.stringify(data.user));
            updateUserUI(data.user);
            showToast(`Ingresó: ${data.user.full_name}`);
            initializeApp();

        } catch (error) {
            console.error("Error en login:", error);
            loginErrorText.textContent = error.message;
            loginError.classList.remove('hidden');
        } finally {
            hideLoading(loginSubmitBtn); 
        }
    };
    
    // 2. Lógica de Cerrar Sesión
    const handleLogout = () => {
        localStorage.removeItem('lubricadora_user');
        loginView.classList.remove('hidden');
        appView.classList.add('hidden');
        window.location.reload(); 
    };

    // 3. Actualizar UI del Usuario (nombre y rol)
    const updateUserUI = (user) => {
        if (userDisplayName && user) {
            userDisplayName.textContent = user.full_name || 'Usuario';
        }
        if (userDisplayRole && user) {
            userDisplayRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
        }
        
        // Controlar visibilidad de menús según el rol
        if (user) {
            const isAdmin = user.role === 'administrador';
            const adminOnlyElements = document.querySelectorAll('.admin-only');
            
            adminOnlyElements.forEach(element => {
                if (isAdmin) {
                    // Si es administrador, mostrar
                    element.classList.remove('hidden');
                    if (element.classList.contains('nav-link')) {
                        element.style.display = 'flex';
                    }
                } else {
                    // Si es vendedor, ocultar
                    element.classList.add('hidden');
                    if (element.classList.contains('nav-link')) {
                        element.style.display = 'none';
                    }
                }
            });
            
            // Mostrar menú de usuarios solo si es administrador
            if (manageUsersLink && user) {
                if (user.role === 'administrador') {
                    manageUsersLink.classList.remove('hidden');
                } else {
                    manageUsersLink.classList.add('hidden');
                }
            }
        }
        currentUser = user;
    };

    // 4. Lógica de Navegación (Mostrar Vistas)
    const showView = (viewId) => {
        // Verificar permisos de rol
        const adminOnlyViews = ['add-product-view', 'delete-product-view', 'manage-brands-view', 'manage-categories-view', 'manage-suppliers-view', 'manage-users-view'];
        
        // Si el usuario es vendedor y trata de acceder a una vista solo para admin, redirigir a inventario
        if (currentUser && currentUser.role === 'vendedor' && adminOnlyViews.includes(viewId)) {
            viewId = 'inventory-view';
        }
        
        // Ocultar todas las vistas
        Object.values(views).forEach(view => { if (view) view.classList.add('hidden');});
        
        // Mostrar la vista seleccionada
        const targetView = views[viewId] || views['inventory-view'];
        targetView.classList.remove('hidden');
        
        // Actualizar el estado activo del link
        navLinks.forEach(link => {
            if (link.dataset.target === viewId) {
                link.classList.add('bg-slate-800', 'text-white');
                link.classList.remove('text-slate-300', 'hover:bg-slate-800');
            } else {
                link.classList.remove('bg-slate-800', 'text-white');
                link.classList.add('text-slate-300', 'hover:bg-slate-800');
            }
        });
        
          // Acciones específicas de cada vista
              if (viewId === 'add-product-view') {
            addProductForm.reset();
            setTimeout(() => firstInput.focus(), 100);
        }
              if (viewId === 'delete-product-view') {
             deleteSearch.value = '';
             deleteResultsList.innerHTML = `<li class="px-6 py-12 text-center text-gray-500"><i data-lucide="search" class="mx-auto h-12 w-12 text-gray-300 mb-4"></i><p class="text-lg font-medium text-gray-900">Busque un producto arriba</p></li>`;
             lucide.createIcons();
        }
              if (viewId === 'manage-brands-view') {
             loadAndRenderBrands();
        }
              if (viewId === 'manage-categories-view') {
             loadAndRenderCategories();
        }
              if (viewId === 'manage-suppliers-view') { 
             loadAndRenderSuppliers(); // Carga los proveedores al mostrar la vista
        }
              if (viewId === 'manage-users-view') { 
             loadAndRenderUsers(); // Carga los usuarios al mostrar la vista
        }
    };
    
    // --- FUNCIONES DE CARGA DE DATOS (API) ---

    // 5. Cargar Inventario
    const loadInventory = async () => {
        try {
            const response = await fetch(`${API_URL}/inventory`);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            fullInventory = data; // Guardar en caché
            renderInventoryTable(fullInventory);
            
        } catch (error) {
            console.error("Error al cargar inventario:", error);
            inventoryTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error al cargar inventario: ${error.message}</td></tr>`;
        }
    };
    
    // 6. Cargar Marcas
    const loadBrands = async () => {
        try {
            const response = await fetch(`${API_URL}/brands`);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            allBrands = data; // Guardar en caché
        } catch (error) {
            console.error("Error al cargar marcas:", error);
        }
    };
    
    // 7. Cargar Proveedores
    const loadSuppliers = async () => {
        try {
            const response = await fetch(`${API_URL}/suppliers`);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            allSuppliers = data; // Guardar en caché
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
        }
    };
    
    // 8. Cargar Categorías
    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`);
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            allCategories = data; // Guardar en caché
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };
    
    // 9. Llenar menús desplegables (<select>)
    const populateDropdowns = (selectElement, items, placeholderText) => {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${placeholderText}</option>`; // Limpiar
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    };

    // 10. Lógica de Dibujado de Tabla
     const renderInventoryTable = (inventoryData) => {
        inventoryTableBody.innerHTML = ''; 
        
        if (inventoryData.length === 0) {
            inventoryTableBody.innerHTML = `<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">No se encontraron productos.</td></tr>`;
            return;
        }
        
        inventoryData.forEach(product => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 border-b border-gray-50";
            
            const price = parseFloat(product.price) || 0;
            
            // BÚSQUEDA INTELIGENTE 
            const createdVal = product.createdAt || product.createdat || product.fecha_creacion || product.fechaCreacion;
            const editedVal = product.fecha_edicion || product.fechaedicion || product.updatedAt || product.updated_at;

            tr.innerHTML = `
                <td class="px-4 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                    <div class="text-xs text-gray-500">${product.specification || ''}</div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${product.brand_name || 'N/A'}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${product.category_name || 'N/A'}</td>
                <td class="px-4 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                        ${product.stock} ${product.unit}
                    </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">$${price.toFixed(2)}</td>
                
                <!-- Celdas de Fecha (Usa la función formatDate y las variables inteligentes) -->
                <td class="px-4 py-4 whitespace-nowrap text-xs text-gray-700 font-medium">${formatDate(createdVal)}</td>
                <td class="px-4 py-4 whitespace-nowrap text-xs text-gray-700 font-medium">${formatDate(editedVal)}</td>

                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                        <button class="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" data-action="info" data-id="${product.id}" title="Ver Info"><i data-lucide="eye" class="h-4 w-4" style="pointer-events: none;"></i></button>
                        <button class="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded" data-action="edit" data-id="${product.id}" title="Editar"><i data-lucide="edit-3" class="h-4 w-4" style="pointer-events: none;"></i></button>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(tr);
        });
        lucide.createIcons();
    };
    
    // 11. Lógica de Búsqueda
    const handleInventorySearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = fullInventory.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.brand_name && p.brand_name.toLowerCase().includes(searchTerm)) ||
            (p.supplier_name && p.supplier_name.toLowerCase().includes(searchTerm)) ||
            (p.category_name && p.category_name.toLowerCase().includes(searchTerm))
        );
        renderInventoryTable(filtered);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productData = Object.fromEntries(formData.entries());
        
        // Conversiones
        productData.cost = parseFloat(productData.cost) || 0;
        productData.price = parseFloat(productData.price) || 0;
        productData.stock = parseInt(productData.stock, 10) || 0;
        productData.brand_id = parseInt(productData.brand_id, 10) || null;
        productData.supplier_id = parseInt(productData.supplier_id, 10) || null;
        productData.category_id = parseInt(productData.category_id, 10) || null;
        
        try {
            const response = await fetch(`${API_URL}/inventory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
            
            e.target.reset();
            fullInventory.push(data);
            renderInventoryTable(fullInventory);
            alert('¡Producto guardado exitosamente!');
            showView('inventory-view');
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };    

    // 13. Lógica del MODAL (Editar y Ver)
    
    const openEditModal = (productId) => {
        currentEditProductId = productId;
        const product = fullInventory.find(p => p.id === productId);
        if (!product) return;
        
        modalTitle.textContent = "Editar Producto";
        renderModalContent(product, false);
        modalSaveButton.classList.remove('hidden');
        modal.classList.remove('hidden');
        lucide.createIcons();
    };
    
    const openInfoModal = (productId) => {
        currentEditProductId = null;
        const product = fullInventory.find(p => p.id === productId);
        if (!product) return;
        
        modalTitle.textContent = `Info: ${product.name}`;
        renderModalContent(product, true);
        modalSaveButton.classList.add('hidden');
        modal.classList.remove('hidden');
        lucide.createIcons();
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        currentEditProductId = null;
    };
    
    const renderModalContent = (product, isReadOnly) => {
        const disabled = isReadOnly ? 'disabled' : '';
        const readOnlyClasses = isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 focus:bg-white';
        
        const brandsOptions = allBrands.map(b => `<option value="${b.id}" ${product.brand_id == b.id ? 'selected' : ''}>${b.name}</option>`).join('');
        const suppliersOptions = allSuppliers.map(s => `<option value="${s.id}" ${product.supplier_id == s.id ? 'selected' : ''}>${s.name}</option>`).join('');
        const categoriesOptions = allCategories.map(c => `<option value="${c.id}" ${product.category_id == c.id ? 'selected' : ''}>${c.name}</option>`).join('');

        const cost = parseFloat(product.cost) || 0;
        const price = parseFloat(product.price) || 0;
        
        // Aseguramos que las variables se usen correctamente en el template string
        editProductForm.innerHTML = `
            <div class="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" name="name" value="${product.name}" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses} sm:text-sm"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Marca</label><select name="brand_id" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"><option value="">--</option>${brandsOptions}</select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label><select name="category_id" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"><option value="">--</option>${categoriesOptions}</select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Especificación</label><input type="text" name="specification" value="${product.specification || ''}" ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Unidad</label><input type="text" name="unit" value="${product.unit}" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"></div>
                <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Proveedor</label><select name="supplier_id" ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"><option value="">--</option>${suppliersOptions}</select></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Costo</label><input type="number" name="cost" step="0.01" value="${cost.toFixed(2)}" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Precio</label><input type="number" name="price" step="0.01" value="${price.toFixed(2)}" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" name="stock" step="1" value="${product.stock}" required ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}"></div>
                <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Info</label><textarea name="info" rows="2" ${disabled} class="block w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm ${readOnlyClasses}">${product.info || ''}</textarea></div>
            </div>
        `;
    };

    // 14. Lógica de Guardado (desde el Modal de Editar)
    const handleModalSave = async (e) => {
        e.preventDefault();
        if (!currentEditProductId) return;
        
        const formData = new FormData(editProductForm);
        const productData = Object.fromEntries(formData.entries());
        productData.cost = parseFloat(productData.cost) || 0;
        productData.price = parseFloat(productData.price) || 0;
        productData.stock = parseInt(productData.stock, 10) || 0;
        productData.brand_id = parseInt(productData.brand_id, 10) || null;
        productData.supplier_id = parseInt(productData.supplier_id, 10) || null;
        productData.category_id = parseInt(productData.category_id, 10) || null;
        
        try {
            const response = await fetch(`${API_URL}/inventory/${currentEditProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

            closeModal();
            await loadInventory();
            alert('¡Producto actualizado exitosamente!');
            
        } catch (error) {
            console.error("Error actualizando producto:", error);
            alert(`Error actualizando producto: ${error.message}`);
        } finally {
            currentEditProductId = null;
        }
    };
    
    // 15. Lógica de "Borrar Producto" (Vista dedicada)
    const handleSearchForDelete = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        deleteResultsList.innerHTML = '';
        
        if (searchTerm.length < 2) {
             deleteResultsList.innerHTML = `<li class="px-6 py-12 text-center text-gray-500"><i data-lucide="search" class="mx-auto h-12 w-12 text-gray-300 mb-4"></i><p class="text-lg font-medium text-gray-900">Busque un producto arriba</p></li>`;
             lucide.createIcons();
             return;
        }
        
        const filtered = fullInventory.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.brand_name && p.brand_name.toLowerCase().includes(searchTerm))
        );
        
        if (filtered.length === 0) {
            deleteResultsList.innerHTML = `<li class="px-6 py-4 text-center text-gray-500">No se encontraron productos.</li>`;
            return;
        }
        
        filtered.forEach(product => {
            const li = document.createElement('li');
            li.className = 'px-6 py-5 flex items-center justify-between';
            li.innerHTML = `
                <div>
                    <p class="text-sm font-medium text-gray-900">${product.name}</p>
                    <p class="text-sm text-gray-500">${product.brand_name || 'N/A'} - Stock: ${product.stock}</p>
                </div>
                <button 
                    data-id="${product.id}" 
                    data-stock="${product.stock}"
                    class="delete-btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white ${product.stock > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}"
                    ${product.stock > 0 ? 'disabled' : ''}
                >
                    <i data-lucide="trash-2" class="h-4 w-4 mr-2"></i>
                    ${product.stock > 0 ? 'Stock > 0' : 'Eliminar'}
                </button>
            `;
            deleteResultsList.appendChild(li);
        });
        lucide.createIcons();
    };
    
    // 16. Lógica de Borrado (Botón)
    const handleDeleteProduct = async (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (!deleteButton) return;
        
        const productId = deleteButton.dataset.id;
        const stock = parseInt(deleteButton.dataset.stock, 10);
        
        if (stock > 0) {
            alert('No se puede eliminar un producto con stock positivo.');
            return;
        }
        if (!confirm(`¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.`)) {
            return;
        }
        
        
        try {
            const response = await fetch(`${API_URL}/inventory/${productId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

            alert('Producto eliminado exitosamente.');
            await loadInventory();
            handleSearchForDelete({ target: { value: deleteSearch.value } });

        } catch (error) {
            console.error("Error eliminando producto:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // --- FUNCIONES DE GESTIÓN DE MARCAS ---

    // 17. Cargar y dibujar la tabla de marcas
    const loadAndRenderBrands = async () => {
        brandsTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">Cargando marcas...</td></tr>`;
        try {
            const response = await fetch(`${API_URL}/brands`); 
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const brands = await response.json();
            
            allBrands = brands;
            
            brandsTableBody.innerHTML = ''; 
            if (brands.length === 0) {
                brandsTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No hay marcas registradas.</td></tr>`;
                return;
            }

            brands.forEach(brand => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50";
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${brand.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${brand.description || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50" 
                                data-action="edit-brand" 
                                data-id="${brand.id}" 
                                data-name="${brand.name}" 
                                data-description="${brand.description || ''}" 
                                title="Editar Marca">
                            <i data-lucide="edit-3" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50" 
                                data-action="delete-brand" 
                                data-id="${brand.id}" 
                                title="Eliminar Marca">
                            <i data-lucide="trash-2" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                    </td>
                `;
                brandsTableBody.appendChild(tr);
            });
            lucide.createIcons();
            
            populateDropdowns(addBrandSelect, allBrands, '-- Seleccione una Marca --');
            
        } catch (error) {
            console.error("Error al cargar marcas:", error);
            brandsTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-red-500">Error al cargar marcas: ${error.message}</td></tr>`;
        }
    };

    // 18. Manejar "Añadir Marca"
    const handleAddBrand = async (e) => {
        e.preventDefault();
        const name = e.target.elements['name'].value.trim();
        const description = e.target.elements['description'].value.trim();
        
        if (!name) {
            alert('El nombre de la marca no puede estar vacío.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/brands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            const data = await response.json();
            
            if (!response.ok) {
                 throw new Error(data.error || `Error ${response.status}`);
            }
            
            alert('Marca añadida exitosamente.');
            e.target.reset();
            loadAndRenderBrands();
            
        } catch (error) {
            console.error("Error añadiendo marca:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 19. Manejar "Editar" o "Borrar" Marca
    const handleBrandAction = (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        
        const action = button.dataset.action;
        const id = button.dataset.id;
        
        if (action === 'edit-brand') {
            const name = button.dataset.name;
            const description = button.dataset.description;
            handleEditBrand(id, name, description);
        } else if (action === 'delete-brand') {
            handleDeleteBrand(id);
        }
    };

    // 20. Lógica de Edición de Marca
    const handleEditBrand = async (brandId, currentName, currentDescription) => {
        const newName = prompt("Introduce el nuevo nombre para la marca:", currentName);
        
        if (!newName || newName.trim() === '' || newName === currentName) {
            return;
        }
        
        const newDescription = prompt("Introduce la nueva descripción:", currentDescription);
        
        try {
            const response = await fetch(`${API_URL}/brands/${brandId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
            
            alert('Marca actualizada exitosamente.');
            loadAndRenderBrands();
            
        } catch (error) {
            console.error("Error actualizando marca:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 21. Lógica de Borrado de Marca
    const handleDeleteBrand = async (brandId) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar esta marca?\n\nADVERTENCIA: Si la marca está en uso, no se podrá eliminar.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/brands/${brandId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

            alert('Marca eliminada exitosamente.');
            loadAndRenderBrands();

        } catch (error) {
            console.error("Error eliminando marca:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // --- FUNCIONES DE GESTIÓN DE CATEGORÍAS ---
    
    // 22. Cargar y dibujar la tabla de categorías
    const loadAndRenderCategories = async () => {
        categoriesTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">Cargando categorías...</td></tr>`;
        try {
            const response = await fetch(`${API_URL}/categories`); 
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const categories = await response.json();
            
            allCategories = categories;
            
            categoriesTableBody.innerHTML = ''; 
            if (categories.length === 0) {
                categoriesTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No hay categorías registradas.</td></tr>`;
                return;
            }

            categories.forEach(category => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50";
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${category.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category.description || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50" 
                                data-action="edit-category" 
                                data-id="${category.id}" 
                                data-name="${category.name}" 
                                data-description="${category.description || ''}" 
                                title="Editar Categoría">
                            <i data-lucide="edit-3" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50" 
                                data-action="delete-category" 
                                data-id="${category.id}" 
                                title="Eliminar Categoría">
                            <i data-lucide="trash-2" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                    </td>
                `;
                categoriesTableBody.appendChild(tr);
            });
            lucide.createIcons();
            
            populateDropdowns(addCategorySelect, allCategories, '-- Seleccione una Categoría --');
            
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            categoriesTableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-red-500">Error al cargar categorías: ${error.message}</td></tr>`;
        }
    };

    // 23. Manejar "Añadir Categoría"
    const handleAddCategory = async (e) => {
        e.preventDefault();
        const name = e.target.elements['name'].value.trim();
        const description = e.target.elements['description'].value.trim();
        
        if (!name) {
            alert('El nombre de la categoría no puede estar vacío.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            const data = await response.json();
            
            if (!response.ok) {
                 throw new Error(data.error || `Error ${response.status}`);
            }
            
            alert('Categoría añadida exitosamente.');
            e.target.reset();
            loadAndRenderCategories();
            
        } catch (error) {
            console.error("Error añadiendo categoría:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 24. Manejar "Editar" o "Borrar" Categoría
    const handleCategoryAction = (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        
        const action = button.dataset.action;
        const id = button.dataset.id;
        
        if (action === 'edit-category') {
            const name = button.dataset.name;
            const description = button.dataset.description;
            handleEditCategory(id, name, description);
        } else if (action === 'delete-category') {
            handleDeleteCategory(id);
        }
    };

    // 25. Lógica de Edición de Categoría
    const handleEditCategory = async (categoryId, currentName, currentDescription) => {
        const newName = prompt("Introduce el nuevo nombre para la categoría:", currentName);
        
        if (!newName || newName.trim() === '' || newName === currentName) {
            return;
        }
        
        const newDescription = prompt("Introduce la nueva descripción:", currentDescription);
        
        try {
            const response = await fetch(`${API_URL}/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
            
            alert('Categoría actualizada exitosamente.');
            loadAndRenderCategories();
            
        } catch (error) {
            console.error("Error actualizando categoría:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 26. Lógica de Borrado de Categoría
    const handleDeleteCategory = async (categoryId) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar esta categoría?\n\nADVERTENCIA: Si la categoría está en uso, no se podrá eliminar.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/categories/${categoryId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

            alert('Categoría eliminada exitosamente.');
            loadAndRenderCategories();

        } catch (error) {
            console.error("Error eliminando categoría:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // --- FUNCIONES DE GESTIÓN DE PROVEEDORES (¡NUEVO!) ---
    
    // 27. Cargar y dibujar la tabla de proveedores
    const loadAndRenderSuppliers = async () => {
        suppliersTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Cargando proveedores...</td></tr>`;
        try {
            const response = await fetch(`${API_URL}/suppliers`); 
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const suppliers = await response.json();
            
            allSuppliers = suppliers; // Actualizar caché global
            
            suppliersTableBody.innerHTML = ''; 
            if (suppliers.length === 0) {
                suppliersTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No hay proveedores registrados.</td></tr>`;
                return;
            }

            suppliers.forEach(supplier => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50";
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${supplier.name}</div>
                        <div class="text-sm text-gray-500">${supplier.ruc || 'N/A'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${supplier.phone || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${supplier.email || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${supplier.contact_person || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50" 
                                data-action="edit-supplier" 
                                data-id="${supplier.id}" 
                                data-name="${supplier.name}" 
                                data-ruc="${supplier.ruc || ''}"
                                data-phone="${supplier.phone || ''}"
                                data-email="${supplier.email || ''}"
                                data-contact_person="${supplier.contact_person || ''}"
                                title="Editar Proveedor">
                            <i data-lucide="edit-3" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50" 
                                data-action="delete-supplier" 
                                data-id="${supplier.id}" 
                                title="Eliminar Proveedor">
                            <i data-lucide="trash-2" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                    </td>
                `;
                suppliersTableBody.appendChild(tr);
            });
            lucide.createIcons();
            
            // Re-llenar el desplegable de "Añadir Producto"
            populateDropdowns(addSupplierSelect, allSuppliers, '-- Seleccione un Proveedor --');
            
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
            suppliersTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error al cargar proveedores: ${error.message}</td></tr>`;
        }
    };

    // 28. Manejar "Añadir Proveedor"
    const handleAddSupplier = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const supplierData = Object.fromEntries(formData.entries());
        
        if (!supplierData.name || supplierData.name.trim() === '') {
            alert('El nombre del proveedor es requerido.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/suppliers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData)
            });
            const data = await response.json();
            
            if (!response.ok) {
                 throw new Error(data.error || `Error ${response.status}`);
            }
            
            // Éxito
            alert('Proveedor añadido exitosamente.');
            e.target.reset(); // Limpiar formulario
            loadAndRenderSuppliers(); // Recargar la tabla
            
        } catch (error) {
            console.error("Error añadiendo proveedor:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 29. Manejar "Editar" o "Borrar" Proveedor (Clic en la tabla)
    const handleSupplierAction = (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        
        const action = button.dataset.action;
        const id = button.dataset.id;
        
        if (action === 'edit-supplier') {
            const data = { ...button.dataset }; // Copia todos los data-attributes
            handleEditSupplier(id, data);
        } else if (action === 'delete-supplier') {
            handleDeleteSupplier(id);
        }
    };

    // 30. Lógica de Edición de Proveedor
    const handleEditSupplier = async (supplierId, currentData) => {
        // Usar prompt para cada campo (consistente con Marcas/Categorías)
        const newName = prompt("Introduce el nuevo nombre:", currentData.name);
        if (!newName || newName.trim() === '') return; // Cancelar si el nombre está vacío
        
        const newRuc = prompt("Introduce el RUC:", currentData.ruc);
        const newPhone = prompt("Introduce el Teléfono:", currentData.phone);
        const newEmail = prompt("Introduce el Email:", currentData.email);
        const newContact = prompt("Introduce la Persona de Contacto:", currentData.contact_person);

        const updatedData = {
            name: newName.trim(),
            ruc: newRuc.trim(),
            phone: newPhone.trim(),
            email: newEmail.trim(),
            contact_person: newContact.trim()
        };
        
        try {
            const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
            
            alert('Proveedor actualizado exitosamente.');
            loadAndRenderSuppliers(); // Recargar la tabla
            
        } catch (error) {
            console.error("Error actualizando proveedor:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 31. Lógica de Borrado de Proveedor
    const handleDeleteSupplier = async (supplierId) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar este proveedor?\n\nADVERTENCIA: Si el proveedor está en uso, no se podrá eliminar.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

            alert('Proveedor eliminado exitosamente.');
            loadAndRenderSuppliers(); // Recargar la tabla

        } catch (error) {
            console.error("Error eliminando proveedor:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // --- FUNCIONES DE GESTIÓN DE USUARIOS (¡NUEVO!) ---
    
    // 32. Cargar y dibujar la tabla de usuarios
    const loadAndRenderUsers = async () => {
        usersTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Cargando usuarios...</td></tr>`;
        try {
            const response = await fetch(`${API_URL}/users`); 
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const users = await response.json();
            
            usersTableBody.innerHTML = ''; 
            if (users.length === 0) {
                usersTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No hay usuarios registrados.</td></tr>`;
                return;
            }

            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50";
                const roleClass = user.role === 'administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
                const roleName = user.role === 'administrador' ? 'Administrador' : 'Vendedor';
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${user.username}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${user.full_name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass}">
                            ${roleName}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${formatDate(user.created_at)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50" 
                                data-action="edit-user" 
                                data-id="${user.id}" 
                                data-username="${user.username}" 
                                data-fullname="${user.full_name || ''}"
                                data-role="${user.role}"
                                title="Editar Usuario">
                            <i data-lucide="edit-3" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}" 
                                data-action="delete-user" 
                                data-id="${user.id}"
                                ${user.id === currentUser?.id ? 'disabled' : ''}
                                title="${user.id === currentUser?.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar Usuario'}">
                            <i data-lucide="trash-2" class="h-5 w-5" style="pointer-events: none;"></i>
                        </button>
                    </td>
                `;
                usersTableBody.appendChild(tr);
            });
            lucide.createIcons();
            
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            usersTableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error al cargar usuarios: ${error.message}</td></tr>`;
        }
    };

    // 33. Manejar "Añadir Usuario"
    const handleAddUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());
        
        if (!userData.username || !userData.password || !userData.full_name || !userData.role) {
            alert('Todos los campos son requeridos.');
            return;
        }
        
        if (userData.password.length < 5) {
            alert('La contraseña debe tener al menos 5 caracteres.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            
            if (!response.ok) {
                 throw new Error(data.error || `Error ${response.status}`);
            }
            
            alert('Usuario creado exitosamente.');
            e.target.reset();
            loadAndRenderUsers();
            
        } catch (error) {
            console.error("Error añadiendo usuario:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 34. Manejar "Editar" o "Borrar" Usuario (Clic en la tabla)
    const handleUserAction = (e) => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;
        
        const action = button.dataset.action;
        const id = button.dataset.id;
        
        if (action === 'edit-user') {
            const data = { ...button.dataset };
            handleEditUser(id, data);
        } else if (action === 'delete-user') {
            handleDeleteUser(id);
        }
    };

    // 35. Lógica de Edición de Usuario
    const handleEditUser = async (userId, currentData) => {
        const newUsername = prompt("Introduce el nuevo nombre de usuario:", currentData.username);
        if (!newUsername || newUsername.trim() === '') return;
        
        const newFullName = prompt("Introduce el nombre completo:", currentData.fullname);
        if (!newFullName || newFullName.trim() === '') return;
        
        const newRole = prompt("Introduce el rol (vendedor o administrador):", currentData.role);
        if (!newRole || (newRole !== 'vendedor' && newRole !== 'administrador')) {
            alert('Rol inválido. Debe ser "vendedor" o "administrador".');
            return;
        }
        
        const changePassword = confirm("¿Deseas cambiar la contraseña?");
        let newPassword = null;
        if (changePassword) {
            newPassword = prompt("Introduce la nueva contraseña (mínimo 5 caracteres):");
            if (newPassword && newPassword.length < 5) {
                alert('La contraseña debe tener al menos 5 caracteres.');
                return;
            }
        }

        const updatedData = {
            username: newUsername.trim(),
            full_name: newFullName.trim(),
            role: newRole
        };
        
        if (newPassword) {
            updatedData.password = newPassword;
        }
        
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
            
            alert('Usuario actualizado exitosamente.');
            loadAndRenderUsers();
            
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 36. Lógica de Borrado de Usuario
    const handleDeleteUser = async (userId) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar este usuario?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Error ${response.status}`);

            alert('Usuario eliminado exitosamente.');
            loadAndRenderUsers();

        } catch (error) {
            console.error("Error eliminando usuario:", error);
            alert(`Error: ${error.message}`);
        }
    };

    // 37. Función de inicialización de la app
    const initializeApp = async () => {
        // Mostrar la app y ocultar el login
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        
        // Mostrar la vista de inventario por defecto
        showView('inventory-view');
        
        // Cargar TODOS los datos iniciales en paralelo
        await Promise.all([
            loadInventory(),
            loadBrands(),
            loadSuppliers(),
            loadCategories()
        ]);
        
        // Una vez cargados, llenar los menús desplegables
        populateDropdowns(addBrandSelect, allBrands, '-- Seleccione una Marca --');
        populateDropdowns(addSupplierSelect, allSuppliers, '-- Seleccione un Proveedor --');
        populateDropdowns(addCategorySelect, allCategories, '-- Seleccione una Categoría --');
    };
    

    // ---
    // Inicialización y Asignación de Eventos
    // ---
    
    // Comprobar si ya hay una sesión al cargar la página
    const savedUser = localStorage.getItem('lubricadora_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            updateUserUI(user);
            showToast(`Sesión iniciada como: ${user.full_name}`);
            initializeApp(); // Cargar la app directamente
        } catch (e) {
            // Si hay un error, limpiar y mostrar login
            localStorage.removeItem('lubricadora_user');
            loginView.classList.remove('hidden');
            appView.classList.add('hidden');
        }
    } else {
        // Si no hay sesión, mostrar login
        loginView.classList.remove('hidden');
        appView.classList.add('hidden');
    }

    // Evento de Login
    loginForm.addEventListener('submit', handleLogin);
    
    // Evento de Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Eventos de Navegación (Sidebar)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = e.currentTarget.dataset.target;
            showView(viewId);
        });
    });
    
    // Evento de Añadir Producto
    addProductForm.addEventListener('submit', handleAddProduct);
    
    // Eventos de la Vista de Inventario
    searchInput.addEventListener('input', handleInventorySearch);
    inventoryTableBody.addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        const id = parseInt(e.target.closest('button')?.dataset.id, 10);
        if (action === 'edit') openEditModal(id);
        if (action === 'info') openInfoModal(id);
    });

    // Eventos del Modal
    modalCloseButton.addEventListener('click', closeModal);
    modalCancelButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    editProductForm.addEventListener('submit', handleModalSave);
    
    // Eventos de la Vista de Borrar Producto
    deleteSearch.addEventListener('input', handleSearchForDelete);
    deleteResultsList.addEventListener('click', handleDeleteProduct);

    // Eventos de la Vista de Administrar Marcas
    addBrandForm.addEventListener('submit', handleAddBrand);
    brandsTableBody.addEventListener('click', handleBrandAction);
    
    // Eventos de la Vista de Administrar Categorías
    addCategoryForm.addEventListener('submit', handleAddCategory);
    categoriesTableBody.addEventListener('click', handleCategoryAction);
    
    // Eventos de la Vista de Administrar Proveedores (¡NUEVO!)
    addSupplierForm.addEventListener('submit', handleAddSupplier);
    suppliersTableBody.addEventListener('click', handleSupplierAction);

    // Eventos de la Vista de Administrar Usuarios (¡NUEVO!)
    if (addUserForm) addUserForm.addEventListener('submit', handleAddUser);
    if (usersTableBody) usersTableBody.addEventListener('click', handleUserAction);

    // Inicializar iconos
    lucide.createIcons();
});