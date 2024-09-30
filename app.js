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

// ログイン中のユーザーを表示する関数
function displayUserInfo() {
    const user = auth.currentUser;
    const userInfoElement = document.getElementById('user-info');
    if (user && userInfoElement) {
        userInfoElement.textContent = `${user.email} でログイン中`;
    }
}

// ログイン状態の確認
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("現在ログイン中のユーザー:", user.email);
        displayUserInfo();  // ログイン中のユーザーを表示
    } else {
        console.log("ログインしているユーザーはいません");
        // ログインしていない場合、ログインページへリダイレクト
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

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
    deliveries.unshift(`プラコンNo.${placonBarcode} - 送り状番号: ${destinationBarcode}`);
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
        
        // フォームをリセット
        e.target.reset();

        // プラコンのバーコード入力フィールドにフォーカスを移動
        document.getElementById('placonBarcode').focus();
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

// 検索フォームのサブミット処理
const searchForm = document.getElementById('searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchPlacon = document.getElementById('searchPlacon').value;
        const searchDestination = document.getElementById('searchDestination').value;

        // 検索結果を初期化
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        // プラコン番号と送り状番号でAND検索
        if (searchPlacon && searchDestination) {
            db.collection("placon").orderBy('destinationBarcode')  // まずは destinationBarcode で並び替え
                .where('destinationBarcode', '>=', searchDestination)
                .where('destinationBarcode', '<=', searchDestination + '\uf8ff')
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        const li = document.createElement('li');
                        li.textContent = "該当するデータが見つかりません。";
                        searchResults.appendChild(li);
                    } else {
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            console.log("取得したデータ:", data);  // デバッグ用ログ

                            // プラコン番号の前方一致チェック
                            if (doc.id.startsWith(searchPlacon)) {  
                                // タイムスタンプが存在する場合の処理
                                const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleString() : "N/A";
                                const status = data.status || "N/A";
                                const updatedBy = data.updatedBy || "N/A";

                                // 検索結果を表示
                                const li = document.createElement('li');
                                li.textContent = `プラコン: ${doc.id}, 送り状番号: ${data.destinationBarcode}, ステータス: ${status}, 更新日時: ${timestamp}, 更新者: ${updatedBy}`;
                                searchResults.appendChild(li);
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error("検索エラー:", error);
                });
        }

        // プラコン番号単体での検索
        else if (searchPlacon) {
            db.collection("placon").orderBy(firebase.firestore.FieldPath.documentId())
                .startAt(searchPlacon)
                .endAt(searchPlacon + '\uf8ff')
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        const li = document.createElement('li');
                        li.textContent = "該当するプラコン番号が見つかりません。";
                        searchResults.appendChild(li);
                    } else {
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            // タイムスタンプが存在する場合の処理
                            const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleString() : "N/A";
                            const status = data.status || "N/A";
                            const updatedBy = data.updatedBy || "N/A";

                            const li = document.createElement('li');
                            li.textContent = `プラコン: ${doc.id}, 送り状番号: ${data.destinationBarcode}, ステータス: ${status}, 更新日時: ${timestamp}, 更新者: ${updatedBy}`;
                            searchResults.appendChild(li);
                        });
                    }
                })
                .catch(error => {
                    console.error("プラコン番号検索エラー:", error);
                });
        }

        // 送り状番号単体での検索
        else if (searchDestination) {
            db.collection("placon").where('destinationBarcode', '>=', searchDestination)
                .where('destinationBarcode', '<=', searchDestination + '\uf8ff')
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        const li = document.createElement('li');
                        li.textContent = "該当する送り状番号が見つかりません。";
                        searchResults.appendChild(li);
                    } else {
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            // タイムスタンプが存在する場合の処理
                            const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleString() : "N/A";
                            const status = data.status || "N/A";
                            const updatedBy = data.updatedBy || "N/A";

                            const li = document.createElement('li');
                            li.textContent = `プラコン: ${doc.id}, 送り状番号: ${data.destinationBarcode}, ステータス: ${status}, 更新日時: ${timestamp}, 更新者: ${updatedBy}`;
                            searchResults.appendChild(li);
                        });
                    }
                })
                .catch(error => {
                    console.error("送り状番号検索エラー:", error);
                });
        }

        // 入力がない場合のエラーメッセージ
        else {
            const li = document.createElement('li');
            li.textContent = "プラコン番号または送り状番号を入力してください。";
            searchResults.appendChild(li);
        }
    });
}

// データをエクスポートする関数 (SJISに変換)
function exportData() {
    const user = auth.currentUser;
    if (!user) {
        alert("ログインしていません");
        return;
    }

    // Firestoreからデータを取得
    db.collection("placon").get().then((querySnapshot) => {
        const placonData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleString() : "N/A";
            placonData.push([
                doc.id,  // プラコンバーコード
                data.destinationBarcode || "N/A",  // 送り状番号
                data.status || "N/A",  // ステータス
                timestamp,  // 更新日時
                data.updatedBy || "N/A"  // 登録者
            ]);
        });

        // CSV形式に変換
        let csvContent = "プラコンバーコード,送り状番号,ステータス,更新日時,登録者\n";
        placonData.forEach(row => {
            csvContent += row.join(",") + "\n";
        });

        // SJISに変換
        const sjisArray = Encoding.convert(Encoding.stringToCode(csvContent), {
            to: 'SJIS',
            from: 'UNICODE'
        });

        const sjisBlob = new Blob([new Uint8Array(sjisArray)], { type: "text/csv" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(sjisBlob);
        link.setAttribute("href", url);
        link.setAttribute("download", "placon_data_sjis.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch((error) => {
        console.error("データのエクスポートエラー:", error);
    });
}

