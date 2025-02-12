export async function calculatePageParams(limitParam, pageParam, totalProducts) {
    const limit = (limitParam && !isNaN(parseInt(limitParam, 10))) ? parseInt(limitParam, 10) : 20;
    const totalPages = totalProducts > 0 ? Math.ceil(totalProducts / limit) : 1;
    let page = (pageParam && !isNaN(parseInt(pageParam, 10))) ? parseInt(pageParam, 10) : 1;
    if (page > totalPages) {
        page = totalPages;
    }
    const offset = limit * (page - 1);

    return { limit, offset, page, totalPages };
}


export async function createDataStructureForListProducts(user = null, products = [], title = null,
    quantResults = null, breadcrumbs = [], currentPage = null, totalPages = null,
    offset = null, itemsPerPage = null, displayRegisterModal = true) {
    const data = {
        products: products,
        page: {
            title: title,
            breadcrumbs: breadcrumbs,
            quantResults: quantResults,
            displayRegisterModal: displayRegisterModal
        },
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            itemsPerPage: itemsPerPage,
            offset: offset
        },
        user: user
    }
    return data;
}

export async function createBreadcrumbs(query = null, category = null, subcategory = null, product = null) {
    const breadcrumbs = [
        { name: 'Início', url: '/' },
    ];
    if (category) {
        let categoryName = capitalizeWords(category);
        breadcrumbs.push({ name: categoryName, url: `/c/${category}` });
        if (subcategory) {
            let subcategoryName = capitalizeWords(subcategory);
            breadcrumbs.push({ name: subcategoryName, url: `/c/${category}/${subcategory}` });
            if (product) {
                breadcrumbs.push({ name: product.product_name, url: `/p/${product.product_public_id}` });
            }
        }
    }
    else if (query) {
        breadcrumbs.push({ name: `Busca por: ${query}`, url: `/search?query=${query}` });
    }

    return breadcrumbs;
}


export function capitalizeWords(word) {
    const wordCapitalized = word.charAt(0).toUpperCase() + word.slice(1);
    return wordCapitalized;
}