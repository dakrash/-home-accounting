module.exports = function (res, db, idList) {
    return new Promise((resolve, reject) => {
        db.query(res, 'select sp.id as idRow, sp.product_name, p.id as idProduct, p.name, sp.quantity, p.unit, sp.comment, c.name as categoryName, c.id as categoryId, c.parent_id as categoryParentId, cc.name as categoryParentName, sp.checkbox from shopping_list_product as sp left join products as p on sp.product_id = p.id left join category as c on p.category_id = c.id or sp.category_id = c.id left join category as cc on c.parent_id = cc.id where shopping_list_id = $1 order by c.name, cc.name, sp.checkbox, p.name, sp.product_name', [idList])
            .then((rows) => {
                let arrCategories = [];
                rows.forEach(function (el) {
                        let product = {idRow: el.idrow, quantity: el.quantity};
                        if (el.checkbox === 1) {
                            product.checkbox = el.checkbox
                        }
                        if (el.comment) {
                            product.comment = el.comment
                        }
                        let categoryIndex = null;
                        let subcategoryIndex = null;
                        if (el.idproduct) {
                            product.idProduct = el.idproduct;
                            product.name = el.name;
                            product.quantity += ' ' + el.unit;
                        } else {
                            product.name = el.product_name;
                        }
                        if (el.categoryparentid) {
                            let fl = 0;
                            arrCategories.forEach(function (elem, i) {
                                if (elem.id === el.categoryparentid) {
                                    elem.subcategories.forEach(function (element, j) {
                                        if (element.id === el.categoryid) {
                                            subcategoryIndex = j;
                                        }
                                        fl++
                                    });
                                    categoryIndex = i;
                                }
                            });


                            if (subcategoryIndex === null) {
                                subcategoryIndex = fl
                            }
                        } else {
                            arrCategories.forEach(function (elem, i) {
                                if (elem.id === el.categoryid) {
                                    categoryIndex = i
                                }
                            })
                        }

                        if (categoryIndex === null) {
                            if (subcategoryIndex !== null) {
                                arrCategories.push({
                                    id: el.categoryparentid,
                                    name: el.categoryparentname,
                                    subcategories: [],
                                    items: []
                                });
                            } else {
                                arrCategories.push({
                                    id: el.categoryid,
                                    name: el.categoryname,
                                    subcategories: [],
                                    items: []
                                });
                            }
                            categoryIndex = arrCategories.length - 1;
                        }
                        if (subcategoryIndex !== null) {
                            if (!arrCategories[categoryIndex].subcategories[subcategoryIndex]) {
                                arrCategories[categoryIndex].subcategories[subcategoryIndex] = {
                                    id: el.categoryid,
                                    name: el.categoryname,
                                    items: []
                                }
                            }
                            arrCategories[categoryIndex].subcategories[subcategoryIndex].items.push(product)
                        } else {
                            arrCategories[categoryIndex].items.push(product)
                        }
                    }
                )
                console.log(arrCategories)
                resolve(arrCategories)
            })
    })

}