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

// Firestoreデータベースの参照
const db = firebase.firestore();

// Firebaseの認証サービス
const auth = firebase.auth();

// ログイン処理
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("ログイン成功:", userCredential.user);
                // ログイン成功後の処理 (例: ホームページにリダイレクト)
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error("ログインエラー:", error.message);
                alert("ログインに失敗しました: " + error.message);
            });
    });
}

// ユーザーログアウト
function logout() {
    auth.signOut()
        .then(() => {
            console.log("ログアウトしました");
            window.location.href = 'login.html';  // ログアウト後にログインページへリダイレクト
        })
        .catch((error) => {
            console.error("ログアウトエラー:", error.message);
        });
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("現在ログイン中のユーザー:", user.email);
        // ユーザーがログインしていれば、特定の操作を許可
    } else {
        console.log("ログインしているユーザーはいません");
        // ログインしていない場合、現在のページがログインページでない場合のみリダイレクト
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});



// 出荷情報を登録する関数
function registerShipment(placonBarcode, destinationBarcode) {
    const user = auth.currentUser;  // 現在のログインユーザーを取得
    if (user) {
        console.log("出荷登録処理を開始");  // デバッグ用のログ
        db.collection("placon").doc(placonBarcode).set({
            destinationBarcode: destinationBarcode,
            status: "出荷",
            updatedBy: user.email,  // ログイン中のユーザーのメールアドレスを記録
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
    } else {
        console.error("ユーザーがログインしていません");
    }
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

// 入荷情報を更新する関数
function registerArrival(placonBarcode) {
    const user = auth.currentUser;  // 現在のログインユーザーを取得
    if (user) {
        console.log("入荷登録処理を開始");  // デバッグ用ログ
        db.collection("placon").doc(placonBarcode).update({
            status: "倉庫在庫",
            destinationBarcode: "000000000000",  // destinationBarcodeを更新
            updatedBy: user.email,  // ログイン中のユーザーのメールアドレスを記録
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("入荷情報が更新され、destinationBarcodeが000000000000に設定されました");
        })
        .catch((error) => {
            console.error("エラー: ", error);
        });
    } else {
        console.error("ユーザーがログインしていません");
    }
}

// 入荷フォームのサブミット処理
const arrivalForm = document.getElementById('arrivalForm');
if (arrivalForm) {
    arrivalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const placonBarcode = document.getElementById('arrivalPlaconBarcode').value;
        console.log(`入荷するプラコンバーコード: ${placonBarcode}`);  // デバッグ用ログ
        registerArrival(placonBarcode);
        e.target.reset();
    });
} else {
    console.error("arrivalFormが見つかりません");
}
