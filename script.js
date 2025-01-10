document.addEventListener("DOMContentLoaded", () => {
    const addItemBtn = document.getElementById("add-item-btn");
    const closeSheetBtn = document.getElementById("close-sheet-btn");
    const sheet = document.getElementById("add-item-sheet");
    const submitItem = document.getElementById("submit-item");
    const itemList = document.getElementById("item-list");
    const totalPriceElem = document.getElementById("total-price");

    let totalPrice = 0;

    // 从 Cookie 获取购物清单
    function getShoppingListFromCookie() {
        const cookieName = "shoppingList=";
        const decodedCookie = decodeURIComponent(document.cookie);  // 解码 Cookie
        const cookieArray = decodedCookie.split(';');  // 分割成多个 Cookie 对象

        for (let i = 0; i < cookieArray.length; i++) {
            let c = cookieArray[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);  // 去掉开头的空格
            }
            if (c.indexOf(cookieName) === 0) {
                const shoppingListJson = c.substring(cookieName.length, c.length);  // 获取购物清单 JSON 字符串
                return JSON.parse(shoppingListJson);  // 将 JSON 字符串解析为对象
            }
        }
        return [];  // 如果没有找到购物清单，返回空数组
    }

    // 设置购物清单到 Cookie
    function setShoppingListCookie(shoppingList) {
        const shoppingListJson = JSON.stringify(shoppingList);  // 将购物清单转换为 JSON 字符串
        document.cookie = "shoppingList=" + encodeURIComponent(shoppingListJson) + "; path=/; max-age=" + (60 * 60 * 24 * 365);  // 存储为 Cookie，1年有效期
    }

    // 更新购物清单显示和总价
    function updateShoppingListDisplay(shoppingList) {
        itemList.innerHTML = ''; // 清空现有列表

        totalPrice = 0; // 重置总价
        shoppingList.forEach((item, index) => {
            const total = item.quantity * item.price;
            totalPrice += total;

            // 创建商品项
            const itemElem = document.createElement("div");
            itemElem.className = "item";
            itemElem.innerHTML = `<span>${item.name} x${item.quantity}</span><span>¥ ${total.toFixed(2)}</span><button class="delete-btn" data-index="${index}">删除</button>`;
            itemList.appendChild(itemElem);
        });

        // 更新总价格
        totalPriceElem.textContent = `¥ ${totalPrice.toFixed(2)}`;
    }

    // 初始化：从 Cookie 中读取购物清单并显示
    const shoppingList = getShoppingListFromCookie();
    updateShoppingListDisplay(shoppingList);

    // 打开添加商品页面（滑入动画）
    addItemBtn.addEventListener("click", () => {
        sheet.classList.add("show");
    });

    // 关闭添加商品页面（滑出动画）
    closeSheetBtn.addEventListener("click", () => {
        sheet.classList.remove("show");
    });

    // 添加商品到列表
    submitItem.addEventListener("click", () => {
        const name = document.getElementById("item-name").value.trim();
        const quantity = parseInt(document.getElementById("item-quantity").value);
        const price = parseFloat(document.getElementById("item-price").value);

        if (name && quantity > 0 && price >= 0) {
            const total = quantity * price;

            // 检查并移除占位符提示
            const placeholder = document.querySelector(".placeholder");
            if (placeholder) {
                placeholder.remove();
            }

            // 创建商品项
            const item = { name, quantity, price };

            // 从 Cookie 获取现有购物清单并更新
            const shoppingList = getShoppingListFromCookie();
            shoppingList.push(item);  // 添加新商品到购物清单
            setShoppingListCookie(shoppingList);  // 更新 Cookie

            // 更新购物清单显示和总价
            updateShoppingListDisplay(shoppingList);

            // 重置表单并关闭页面
            document.getElementById("item-name").value = "";
            document.getElementById("item-quantity").value = "1";
            document.getElementById("item-price").value = "";
            sheet.classList.remove("show");
        } else {
            alert("请填写完整信息！");
        }
    });

    // 删除商品
    itemList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const index = e.target.getAttribute("data-index");  // 获取要删除商品的索引

            // 从 Cookie 获取现有购物清单
            const shoppingList = getShoppingListFromCookie();

            // 移除指定索引的商品
            shoppingList.splice(index, 1);

            // 更新 Cookie 和页面
            setShoppingListCookie(shoppingList);
            updateShoppingListDisplay(shoppingList);
        }
    });

    // 点击空白区域关闭页面（滑出动画）
    window.addEventListener("click", (e) => {
        if (e.target === sheet) {
            sheet.classList.remove("show");
        }
    });
});
