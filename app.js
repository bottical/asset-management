// Firestoreデータベースの参照
const db = firebase.firestore();

// 出荷情報を登録する関数
function registerShipment(placonBarcode, destinationBarcode) {
    console.log("出荷登録処理を開始");  // デバッグ用のログ
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
    let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    deliveries.unshift(`プラコンNo.${placonBarcode} - 配送先: ${destinationBarcode}`);
    if (deliveries.length > 10) {
        deliveries.pop();
    }
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
}

// 最近の配送記録を表示する関数
function updateRecentDeliveries() {
    const deliveries = JSON.parse(localStorage.getItem('deliveries')) || [];
    const recentDeliveries = document.getElementById('recentDeliveries');
    if (!recentDeliveries) return;  // recentDeliveriesがない場合は何もしない

    recentDeliveries.innerHTML = '';
    deliveries.forEach(delivery => {
        const li = document.createElement('li');
        li.textContent = delivery;
        recentDeliveries.appendChild(li);
    });
}

// 出荷フォームのサブミット処理
const assetForm = document.getElementById('assetForm');
if (assetForm) {
    assetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const placonBarcode = document.getElementById('placonBarcode').value;
        const destinationBarcode = document.getElementById('destinationBarcode').value;
        console.log(`バーコード: ${placonBarcode}, 配送先: ${destinationBarcode}`);  // デバッグ用のログ
        registerShipment(placonBarcode, destinationBarcode);
        e.target.reset();
    });
}

// ページ読み込み時に最近の配送記録を表示
window.addEventListener('load', () => {
    console.log("ページ読み込み完了");  // デバッグ用のログ
    updateRecentDeliveries();
});
