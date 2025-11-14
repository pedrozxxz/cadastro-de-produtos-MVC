// ==================== MODEL (Camada de Dados) ====================
class ProductModel {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.searchTerm = '';
    }

    addProduct(productData) {
        const newProduct = {
            id: Date.now(),
            name: productData.name.trim(),
            price: parseFloat(productData.price),
            category: productData.category,
            stock: parseInt(productData.stock),
            createdAt: new Date().toLocaleString('pt-BR')
        };
        
        this.products.unshift(newProduct);
        this.saveToLocalStorage();
        return newProduct;
    }

    removeProduct(productId) {
        const productIndex = this.products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    getFilteredProducts() {
        if (!this.searchTerm) {
            return this.products;
        }
        
        return this.products.filter(product => 
            product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    getAllProducts() {
        return this.products;
    }

    setSearchTerm(term) {
        this.searchTerm = term;
    }

    getStats() {
        const total = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + (product.price * product.stock), 0);
        
        return { total, totalValue: totalValue.toFixed(2) };
    }

    saveToLocalStorage() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }
}
// MODEL: Cuida dos dados - armazena e gerencia os produtos

// ==================== VIEW (Camada de Visualização) ====================
class ProductView {
    constructor() {
        this.productForm = document.getElementById('productForm');
        this.productsList = document.getElementById('productsList');
        this.searchInput = document.getElementById('searchInput');
        this.totalProducts = document.getElementById('totalProducts');
        this.totalValue = document.getElementById('totalValue');
        
        this.formElements = {
            name: document.getElementById('productName'),
            price: document.getElementById('productPrice'),
            category: document.getElementById('productCategory'),
            stock: document.getElementById('productStock')
        };
    }

    displayProducts(products) {
        this.productsList.innerHTML = '';

        if (products.length === 0) {
            this.productsList.innerHTML = `
                <div class="empty-state">
                    <p> Nenhum produto encontrado</p>
                    <small>Tente alterar os termos da busca</small>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productElement = this.createProductElement(product);
            this.productsList.appendChild(productElement);
        });
    }

    createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.setAttribute('data-id', product.id);

        productDiv.innerHTML = `
            <div class="product-info">
                <h3>${this.escapeHtml(product.name)}</h3>
                <div class="product-details">
                    <span class="product-price">R$ ${product.price.toFixed(2)}</span>
                    <span class="product-stock">Estoque: ${product.stock}</span>
                    <span class="product-category">${this.getCategoryLabel(product.category)}</span>
                </div>
                <small>Cadastrado em: ${product.createdAt}</small>
            </div>
            <button class="delete-btn" data-id="${product.id}">🗑️</button>
        `;

        return productDiv;
    }

    getCategoryLabel(category) {
        const categories = {
            'eletronicos': 'Eletrônicos',
            'roupas': 'Roupas',
            'livros': 'Livros',
            'casa': 'Casa e Decoração',
            'outros': 'Outros'
        };
        return categories[category] || category;
    }

    updateStats(stats) {
        this.totalProducts.textContent = stats.total;
        this.totalValue.textContent = stats.totalValue;
    }

    getFormData() {
        return {
            name: this.formElements.name.value,
            price: this.formElements.price.value,
            category: this.formElements.category.value,
            stock: this.formElements.stock.value
        };
    }

    clearForm() {
        this.productForm.reset();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindAddProduct(handler) {
        this.productForm.addEventListener('submit', event => {
            event.preventDefault();
            const productData = this.getFormData();
            
            if (this.validateForm(productData)) {
                handler(productData);
                this.clearForm();
            }
        });
    }

    bindRemoveProduct(handler) {
        this.productsList.addEventListener('click', event => {
            if (event.target.classList.contains('delete-btn')) {
                const productId = parseInt(event.target.getAttribute('data-id'));
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    handler(productId);
                }
            }
        });
    }

    bindSearchProducts(handler) {
        this.searchInput.addEventListener('input', (event) => {
            handler(event.target.value);
        });
    }

    validateForm(data) {
        if (!data.name.trim()) {
            alert('Por favor, informe o nome do produto');
            return false;
        }
        if (!data.price || data.price <= 0) {
            alert('Por favor, informe um preço válido');
            return false;
        }
        if (!data.category) {
            alert('Por favor, selecione uma categoria');
            return false;
        }
        if (!data.stock || data.stock < 0) {
            alert('Por favor, informe um estoque válido');
            return false;
        }
        return true;
    }
}
// VIEW: Cuida da interface - mostra os produtos e captura ações do usuário

// ==================== CONTROLLER (Camada de Controle) ====================
class ProductController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.bindAddProduct(this.handleAddProduct.bind(this));
        this.view.bindRemoveProduct(this.handleRemoveProduct.bind(this));
        this.view.bindSearchProducts(this.handleSearchProducts.bind(this));

        this.updateView();
    }

    handleAddProduct(productData) {
        this.model.addProduct(productData);
        this.updateView();
        this.showSuccessMessage('Produto cadastrado com sucesso!');
    }

    handleRemoveProduct(productId) {
        if (this.model.removeProduct(productId)) {
            this.updateView();
            this.showSuccessMessage('Produto removido com sucesso!');
        }
    }

    handleSearchProducts(searchTerm) {
        this.model.setSearchTerm(searchTerm);
        this.updateView();
    }

    updateView() {
        const products = this.model.getFilteredProducts();
        const stats = this.model.getStats();
        
        this.view.displayProducts(products);
        this.view.updateStats(stats);
    }

    showSuccessMessage(message) {
        alert(message);
    }
}
// CONTROLLER: Cuida da lógica - coordena Model e View quando o usuário interage

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    const model = new ProductModel();
    const view = new ProductView();
    const controller = new ProductController(model, view);
});