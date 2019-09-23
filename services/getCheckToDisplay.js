module.exports = function (receiptPositions, db, res, userId) {
    return new Promise((resolve) => {
        db.query(res, 'select * from products where user_id = $1', [userId])
            .then((products) => {
                let getCategories = require('./getCategory');
                let totalSum = 0;

                function getArrProduct(nameProduct, namePosition) {
                    let charsForSearch = [];
                    while (true) {
                        charsForSearch.push(nameProduct.slice(0, 3));
                        if (checkSimilarly(nameProduct, ' ') !== null) {
                            let index = checkSimilarly(nameProduct, ' ');
                            nameProduct = nameProduct.slice(index + 1)
                        } else {
                            break
                        }
                    }

                    let fl = 0;
                    charsForSearch.forEach(function (element, k) {
                        if (checkSimilarly(namePosition, element) !== null) {
                            let index = checkSimilarly(namePosition, element);
                            if (index !== 0) {
                                let lastChar = namePosition.charAt(index - 1);
                                if (lastChar === ' ') {
                                    fl++
                                }
                            } else {
                                fl++
                            }
                        }

                    });
                    if (fl > 0) {
                        return fl
                    } else {
                        return false
                    }
                }

                function sortArrProduct(arr) {
                    let resultArr = [];

                    for (let i = 0; i < arr.length; i++) {
                        for (let j = arr.length - 1; j > i; j--) {
                            if (arr[j].countIndexOf > arr[j - 1].countIndexOf || (arr[j].countIndexOf === arr[j - 1].countIndexOf && arr[j].product.name < arr[j - 1].product.name)) {
                                let moveElem = arr[j];
                                arr[j] = arr[j - 1];
                                arr[j - 1] = moveElem
                            }
                        }
                    }
                    arr.forEach(function (el) {
                        resultArr.push(el.product)
                    });

                    return resultArr
                }

                function checkSimilarly(str, substr) {
                    if (str.toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                        return str.toLowerCase().indexOf(substr.toLowerCase())
                    } else {
                        return null
                    }
                }

                let arrWithSelectElem = require('./arrWithSelectElem');

                getCategories(db, userId, res)
                    .then((categories) => {
                        receiptPositions.forEach(function (el, i) {
                            el.products = arrWithSelectElem(products, el.product_id).arr;
                            if (arrWithSelectElem(products, el.product_id).fl) {
                                el.selectRow = true
                            }
                            totalSum += el.sum;
                            let namePosition = el.name;
                            let arrForSort = [];
                            products.forEach(function (elem, j) {
                                let nameProduct = elem.name;
                                if (getArrProduct(nameProduct, namePosition)) {
                                    let fl = getArrProduct(nameProduct, namePosition);
                                    arrForSort.push({countIndexOf: fl, product: elem})
                                }
                            });
                            let arrProduct = sortArrProduct(arrForSort);
                            el.categories = arrWithSelectElem(categories, el.category_id).arr;
                            if (arrWithSelectElem(categories, el.category_id).fl) {
                                el.selectRow = true
                            }
                            if (arrProduct.length > 0) {
                                el.recommendProduct = arrProduct;
                                el.selectRow = true
                            }
                        });
                        resolve({totalSum: totalSum, items: receiptPositions})
                    })
            })
    })
}