// 出荷情報を登録する関数
function registerShipment(placonBarcode, destinationBarcode) {
    db.collection("placon").doc(placonBarcode).set({
        destinationBarcode: destinationBarcode,
        status: "出荷",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("出荷情報が登録されました");

        // ローカルストレージに保存
        saveToLocalStorage(placonBarcode, destinationBarcode);

        // 最近の配送記録を更新
        updateRecentDeliveries();
    })
    .catch((error) => {
        console.error("エラー: ", error);
    });
}

// ローカルストレージに保存する関数
function saveToLocalStorage(placonBarcode, destinationBarcode) {
    // 現在の履歴を取得
    let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];

    // 新しい出荷情報を追加
    deliveries.unshift(`プラコンNo.${placonBarcode} - 配送先: ${destinationBarcode}`);

    // 履歴を最大10件に制限
    if (deliveries.length > 10) {
        deliveries.pop();
    }

    // ローカルストレージに保存
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
}

// ローカルストレージから履歴を取得し、画面に表示する関数
function updateRecentDeliveries() {
    const deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    const recentDeliveries = document.getElementById('recentDeliveries');
    recentDeliveries.innerHTML = '';

    deliveries.forEach(delivery => {
        const li = document.createElement('li');
        li.textContent = delivery;
        recentDeliveries.appendChild(li);
    });
}

// ページ読み込み時に最近の配送記録を表示
window.addEventListener('load', () => {
    updateRecentDeliveries();
});
