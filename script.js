document.addEventListener("DOMContentLoaded", () => {
    const addItemBtn = document.getElementById("add-item-btn");
    const scanItemBtn = document.getElementById("scan-item-btn");
    const closeSheetBtn = document.getElementById("close-sheet-btn");
    const clearListBtn = document.getElementById('clear-list-btn');
    const sheet = document.getElementById("add-item-sheet");
    const submitItem = document.getElementById("submit-item");
    const itemList = document.getElementById("item-list");
    const totalPriceElem = document.getElementById("total-price");
    const contextMenu = document.getElementById("context-menu");

    let shoppingList = getShoppingListFromCookie();
    let totalPrice = 0;
    let longPressTimer;
    let selectedItemIndex = null;

    // 显示长按菜单
    function showContextMenu(x, y) {
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = "block";
    }

    // 隐藏长按菜单
    function hideContextMenu() {
        contextMenu.style.display = "none";
    }

    // 更新商品列表显示
    function updateShoppingListDisplay() {
        itemList.innerHTML = ''; // 清空现有列表

        totalPrice = 0; // 重置总价

        // 判断购物列表是否为空
        if (shoppingList.length === 0) {
            const placeholderElem = document.createElement("p");
            placeholderElem.className = "placeholder";
            placeholderElem.textContent = "您的购物清单为空";
            itemList.appendChild(placeholderElem); // 显示占位符
        } else {
            shoppingList.forEach((item, index) => {
                const total = item.quantity * item.price;
                totalPrice += total;

                // 创建商品项卡片
                const itemElem = document.createElement("div");
                itemElem.className = "item";
                itemElem.innerHTML = `
                <div class="item-left">
                    <div class="item-icon">${item.name.charAt(0)}</div>
                    <div class="item-info">
                        <span>${item.name}</span>
                        <span class="quantity">x${item.quantity}</span>
                    </div>
                </div>
                <span class="item-price">¥ ${total.toFixed(2)}</span>
            `;

                // 添加长按事件
                itemElem.addEventListener("touchstart", (e) => {
                    selectedItemIndex = index; // 记录被长按的项
                    longPressTimer = setTimeout(() => {
                        const rect = e.target.getBoundingClientRect();
                        showContextMenu(rect.x, rect.y);
                    }, 500); // 长按 500ms 显示菜单
                });

                itemElem.addEventListener("touchend", () => clearTimeout(longPressTimer));
                itemElem.addEventListener("touchmove", () => clearTimeout(longPressTimer));

                itemList.appendChild(itemElem);
            });
        }

        // 更新总价格
        totalPriceElem.textContent = `¥ ${totalPrice.toFixed(2)}`;
    }


    // 菜单选项点击事件
    document.getElementById("edit-option").addEventListener("click", () => {
        if (selectedItemIndex !== null) {
            const item = shoppingList[selectedItemIndex];
            document.getElementById("item-name").value = item.name;
            document.getElementById("item-quantity").value = item.quantity;
            document.getElementById("item-price").value = item.price;
            document.getElementById("item-barcode").value = item.barcode || ""; // 填充条码字段
            hideContextMenu();
            sheet.classList.add("show");
        }
    });

    document.getElementById("delete-option").addEventListener("click", () => {
        if (selectedItemIndex !== null) {
            // 删除选中的商品并同步到 Cookie
            shoppingList.splice(selectedItemIndex, 1);
            setShoppingListCookie();
            updateShoppingListDisplay();
            hideContextMenu();
        }
    });

    // 点击其他区域时隐藏菜单
    document.addEventListener("click", hideContextMenu);

    // 获取购物清单
    function getShoppingListFromCookie() {
        const cookieName = "shoppingList=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let c = cookieArray[i].trim();
            if (c.indexOf(cookieName) === 0) {
                return JSON.parse(c.substring(cookieName.length));
            }
        }
        return [];
    }

    // 设置购物清单到 Cookie
    function setShoppingListCookie() {
        const shoppingListJson = JSON.stringify(shoppingList);
        document.cookie = `shoppingList=${encodeURIComponent(shoppingListJson)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }

    // 打开添加商品页面
    addItemBtn.addEventListener("click", () => {
        sheet.classList.add("show");
    });

    // 关闭添加商品页面
    closeSheetBtn.addEventListener("click", () => {
        sheet.classList.remove("show");
    });

    // 清空商品列表的函数
    // 清空商品列表的函数
    clearListBtn.addEventListener('click', () => {
        const confirmClear = window.confirm("确定要清空所有商品吗？");
        if (confirmClear) {
            shoppingList.length = 0; // 清空 shoppingList 数组
            setShoppingListCookie(); // 同步到 Cookie
            updateShoppingListDisplay(); // 更新购物车显示
        }
    });

    // 扫码功能
    scanItemBtn.addEventListener("click", () => {
        window.open("/scan.html", "scanWindow", "width=600,height=400"); // 打开扫码页面作为弹窗
    });

    // 接收来自扫码页面的消息
    window.addEventListener("message", (event) => {
        // 确保是来自扫码页面的消息
        if (event.origin === window.location.origin && event.data.barcode) {
            const barcode = event.data.barcode;
            const goodsName = event.data.goodsName || ''; // 商品名称
            const price = event.data.price || ''; // 商品价格

            // 填充条码字段
            document.getElementById("item-barcode").value = barcode;

            // 如果有商品名称和价格，则也填充这些信息
            if (goodsName) {
                document.getElementById("item-name").value = goodsName;
            }
            if (price) {
                document.getElementById("item-price").value = price;
            }

            // 打开添加商品页面
            sheet.classList.add("show");
        }
    });

    // 添加商品到列表或更新商品
    submitItem.addEventListener("click", () => {
        const name = document.getElementById("item-name").value.trim();
        const quantity = parseFloat(document.getElementById("item-quantity").value);
        const price = parseFloat(document.getElementById("item-price").value);
        const barcode = document.getElementById("item-barcode").value.trim(); // 获取条码

        if (name && quantity > 0 && price >= 0) {
            if (selectedItemIndex !== null) {
                // 如果正在编辑，更新商品信息
                shoppingList[selectedItemIndex] = { name, quantity, price, barcode };
            } else {
                // 否则添加新商品
                const item = { name, quantity, price, barcode }; // 包括条码字段
                shoppingList.push(item);
            }

            // 更新购物清单并同步到 Cookie
            setShoppingListCookie();
            updateShoppingListDisplay();

            // 重置表单并关闭页面
            document.getElementById("item-name").value = "";
            document.getElementById("item-quantity").value = "1";
            document.getElementById("item-price").value = "";
            document.getElementById("item-barcode").value = ""; // 清空条码
            sheet.classList.remove("show");

            // 清除编辑状态
            selectedItemIndex = null;
        } else {
            alert("请填写完整且有效的信息！");
        }
    });

    // 初始化页面显示
    updateShoppingListDisplay();

    // 点击空白区域关闭页面
    window.addEventListener("click", (e) => {
        if (e.target === sheet) {
            sheet.classList.remove("show");
        }
    });

    // 表单实时验证
    const priceInput = document.getElementById("item-price");
    priceInput.addEventListener("input", () => {
        if (priceInput.value < 0) {
            priceInput.setCustomValidity("价格不能为负数！");
        } else {
            priceInput.setCustomValidity("");
        }
    });
});
