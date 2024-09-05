// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyBxRe1pRI8DaCe-ECkhnqYrroL0YBjo7qI",
  authDomain: "asset-management-53fd3.firebaseapp.com",
  projectId: "asset-management-53fd3",
  storageBucket: "asset-management-53fd3.appspot.com",
  messagingSenderId: "125785721214",
  appId: "1:125785721214:web:613f2e922c6dd66984cb2f"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// 出荷情報を登録する関数
function registerShipment(placonBarcode, destinationBarcode) {
    db.collection("placon").doc(placonBarcode).set({
        destinationBarcode: destinationBarcode,
        status: "出荷",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("出荷情報が登録されました");
    })
    .catch((error) => {
        console.error("エラー: ", error);
    });
}

// 入荷情報を更新する関数
function registerArrival(placonBarcode) {
    db.collection("placon").doc(placonBarcode).update({
        status: "倉庫在庫",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("入荷情報が更新されました");
    })
    .catch((error) => {
        console.error("エラー: ", error);
    });
}

// フォームのサブミット処理
document.getElementById('assetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const placonBarcode = document.getElementById('placonBarcode').value;
    const destinationBarcode = document.getElementById('destinationBarcode').value;
    registerShipment(placonBarcode, destinationBarcode);
    e.target.reset();
});

document.getElementById('arrivalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const placonBarcode = document.getElementById('arrivalPlaconBarcode').value;
    registerArrival(placonBarcode);
    e.target.reset();
});

// 最近の配送記録の更新
function updateRecentDeliveries(deliveries) {
    const recentDeliveries = document.getElementById('recentDeliveries');
    recentDeliveries.innerHTML = '';
    deliveries.forEach(delivery => {
        const li = document.createElement('li');
        li.textContent = delivery;
        recentDeliveries.appendChild(li);
    });
}
