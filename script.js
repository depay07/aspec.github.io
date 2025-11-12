// --- 탭 초기화 및 제어 ---

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

window.onload = function() {
    var tabcontent = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // 첫 번째 탭(AreaScan)만 보이도록 수정
    var firstTab = document.getElementById('AreaScan'); 
    if (firstTab) {
        firstTab.style.display = 'block';
    }
    var firstTabButton = document.getElementsByClassName("tab-link")[0];
    if(firstTabButton) {
        firstTabButton.className += " active";
    }

    // [신규] Speed 탭의 드롭다운도 초기화
    populateSpeedModels();
};

// --- 1. Area Scan 계산기 ---
// (cameradb.js가 로드되었는지 확인하는 로직은 populateModels에서 처리)

function populateModels() {
    if (typeof cameraDb === 'undefined') {
        alert("cameradb.js 파일을 찾을 수 없습니다.");
        return;
    }
    const brand = document.getElementById('cameraBrand').value;
    const modelSelect = document.getElementById('cameraModel');
    modelSelect.innerHTML = '<option value="">-- 모델 선택 --</option>';
    if (!brand || !cameraDb[brand]) {
        return;
    }
    cameraDb[brand].forEach((cam, index) => {
        if (cam.sensorH) { 
            const option = document.createElement('option');
            option.value = index;
            option.textContent = cam.name;
            modelSelect.appendChild(option);
        }
    });
}

function selectCamera() {
    const brand = document.getElementById('cameraBrand').value;
    const modelIndex = document.getElementById('cameraModel').value;
    if (!brand || modelIndex === "") {
        document.getElementById('sensorH').value = "";
        document.getElementById('sensorV').value = "";
        document.getElementById('resH').value = "";
        document.getElementById('resV').value = "";
        return;
    }
    const cam = cameraDb[brand][modelIndex];
    document.getElementById('sensorH').value = cam.sensorH.toFixed(2);
    document.getElementById('sensorV').value = cam.sensorV.toFixed(2);
    document.getElementById('resH').value = cam.resH;
    document.getElementById('resV').value = cam.resV;
}

function calculateAreaScan(type) {
    const sH = parseFloat(document.getElementById('sensorH').value);
    const sV = parseFloat(document.getElementById('sensorV').value);
    let f = parseFloat(document.getElementById('focalLength').value);
    let wd = parseFloat(document.getElementById('workingDistance').value);
    let fovH = parseFloat(document.getElementById('fovH').value);
    let fovV = parseFloat(document.getElementById('fovV').value);
    if (!sH) {
        alert("먼저 카메라 모델을 선택하세요.");
        return;
    }
    try {
        if (type === 'focal') {
            if (!wd || !fovH) throw new Error("WD와 FOV H 값을 입력하세요.");
            f = (sH * wd) / fovH;
            document.getElementById('focalLength').value = f.toFixed(2);
        } else if (type === 'wd') {
            if (!f || !fovH) throw new Error("초점 거리와 FOV H 값을 입력하세요.");
            wd = (f * fovH) / sH;
            document.getElementById('workingDistance').value = wd.toFixed(2);
        } else if (type === 'fov') {
            if (!f || !wd) throw new Error("초점 거리와 WD 값을 입력하세요.");
            fovH = (sH * wd) / f;
            document.getElementById('fovH').value = fovH.toFixed(2);
        }
        if (!isNaN(fovH) && fovH > 0) {
            fovV = (fovH * sV) / sH;
            document.getElementById('fovV').value = fovV.toFixed(2);
        }
    } catch (e) {
        alert(e.message);
    }
}

// --- 2. [신규] Area Scan Speed 계산기 ---

function populateSpeedModels() {
    if (typeof cameraDb === 'undefined') {
        // alert("cameradb.js 파일을 찾을 수 없습니다."); // 중복 알림 방지
        return;
    }
    // AreaScan 탭과 다른 ID를 사용 ('speed_')
    const brand = document.getElementById('speed_cameraBrand').value;
    const modelSelect = document.getElementById('speed_cameraModel');
    modelSelect.innerHTML = '<option value="">-- 모델 선택 --</option>';
    if (!brand || !cameraDb[brand]) {
        return;
    }
    cameraDb[brand].forEach((cam, index) => {
        // fps 데이터가 있는 모델만 스피드 탭에 표시 (sensorH도 있어야 함)
        if (cam.sensorH && cam.fps) { 
            const option = document.createElement('option');
            option.value = index;
            option.textContent = cam.name;
            modelSelect.appendChild(option);
        }
    });
}

function selectSpeedCamera() {
    const brand = document.getElementById('speed_cameraBrand').value;
    const modelIndex = document.getElementById('speed_cameraModel').value;
    const fpsInput = document.getElementById('cameraFPS');
    
    if (!brand || modelIndex === "") {
        fpsInput.value = "";
        return;
    }
    const cam = cameraDb[brand][modelIndex];
    // cam.fps가 존재하면 값을 넣고, 없으면 빈칸
    fpsInput.value = cam.fps ? cam.fps : ""; 
}

function calculateAreaSpeed() {
    const speed = parseFloat(document.getElementById('lineSpeedValue').value);
    const unit = document.getElementById('lineSpeedUnit').value;
    const length = parseFloat(document.getElementById('inspectionLength').value);
    const cameraFPS = parseFloat(document.getElementById('cameraFPS').value) || 0; // 선택된 카메라 FPS
    const resultBox = document.getElementById('speedResult');

    if (!speed || !length || speed <= 0 || length <= 0) {
        resultBox.innerHTML = "<p>유효한 라인 속도와 검사 간격을 입력하세요.</p>";
        return;
    }

    // 1. 라인 속도를 mm/sec로 변환
    let lineSpeed_mm_sec = 0;
    if (unit === 'm/min') {
        // 40 m/min -> 40 * 1000 mm / 60 sec = 666.6 mm/sec
        lineSpeed_mm_sec = (speed * 1000) / 60;
    } else { // 'mm/sec'
        lineSpeed_mm_sec = speed;
    }

    // 2. 필요 FPS 계산 (초당 필요한 트리거 수)
    // (666 mm/sec) / (50 mm/검사) = 13.33 검사/sec = 13.33 FPS
    const requiredFPS = lineSpeed_mm_sec / length;

    // 3. 1개 검사당 허용 시간 (Takt Time) 계산
    // 1 / (13.33 FPS) = 0.075 sec/검사 = 75 ms/검사
    const allowedTime_ms = (1 / requiredFPS) * 1000;

    // 4. 카메라 성능 비교
    let fpsComparison = "";
    if (cameraFPS > 0) { // 카메라가 선택되었다면
        if (cameraFPS >= requiredFPS) {
            fpsComparison = `<p class="good">선택한 카메라 FPS (${cameraFPS} Hz)는 요구 사양 (${requiredFPS.toFixed(2)} Hz)을 만족합니다. (OK)</p>`;
        } else {
            fpsComparison = `<p class="bad">선택한 카메라 FPS (${cameraFPS} Hz)가 요구 사양 (${requiredFPS.toFixed(2)} Hz)보다 낮습니다! (NG)</p>`;
        }
    } else {
        fpsComparison = `<p>카메라를 선택하면 FPS 사양을 비교할 수 있습니다.</p>`;
    }

    // 결과 출력
    resultBox.innerHTML = `
        <p><b>라인 속도 (변환):</b> ${lineSpeed_mm_sec.toFixed(2)} mm/sec</p>
        <p><b>요구 FPS:</b> ${requiredFPS.toFixed(2)} fps (Triggers/sec)</p>
        <p><b>검사당 허용 시간 (Takt):</b> ${allowedTime_ms.toFixed(2)} ms</p>
        <hr style="margin: 15px 0;">
        ${fpsComparison}
    `;
}


// --- 3. Line Scan 계산기 ---
function calculateLineScan() {
    // (이하 동일)
    const fov = parseFloat(document.getElementById('lineFov').value);
    const pixels = parseFloat(document.getElementById('linePixels').value);
    const resultBox = document.getElementById('lineResult');
    if (!fov || !pixels || fov <= 0 || pixels <= 0) {
        resultBox.innerHTML = "<p>유효한 FOV와 센서 해상도를 입력하세요.</p>";
        return;
    }
    const resolution = (fov * 1000) / pixels;
    resultBox.innerHTML = `
        <p><b>광학 해상도:</b> ${resolution.toFixed(2)} µm/pixel</p>
        <p>(1 픽셀이 실제 대상의 ${resolution.toFixed(2)} 마이크로미터를 의미합니다.)</p>
    `;
}

// --- 4. Depth of Field (DOF) 계산기 ---
function calculateDOF() {
    // (이하 동일)
    const f = parseFloat(document.getElementById('dofFocalLength').value);
    const wd = parseFloat(document.getElementById('dofWD').value);
    const N = parseFloat(document.getElementById('dofAperture').value);
    let c = parseFloat(document.getElementById('dofCoC').value);
    const resultBox = document.getElementById('dofResult');
    if (!f || !wd || !N || !c) {
        resultBox.innerHTML = "<p>모든 값을 입력하세요.</p>";
        return;
    }
    if (f <= 0 || wd <= 0 || N <= 0 || c <= 0) {
        resultBox.innerHTML = "<p>모든 값은 0보다 커야 합니다.</p>";
        return;
    }
    c = c / 1000;
    const hyperfocal = Math.pow(f, 2) / (N * c);
    const nearLimit = (wd * (hyperfocal - f)) / (hyperfocal + wd - (2 * f));
    const farLimit = (wd * (hyperfocal - f)) / (hyperfocal - wd);
    let totalDof;
    let nearText, farText;
    if (farLimit <= 0 || farLimit > 999999) { 
        totalDof = Infinity;
        nearText = nearLimit.toFixed(2);
        farText = "무한대 (∞)";
    } else {
        totalDof = farLimit - nearLimit;
        nearText = nearLimit.toFixed(2);
        farText = farLimit.toFixed(2);
    }
    resultBox.innerHTML = `
        <p><b>총 심도 (Total DOF):</b> ${totalDof === Infinity ? '무한대' : totalDof.toFixed(2) + ' mm'}</p>
        <p><b>근점 (Near Limit):</b> ${nearText} mm</p>
        <p><b>원점 (Far Limit):</b> ${farText} mm</p>
    `;
}

// --- 5. Barcode Reader 계산기 (Mockup) ---
const barcodeSpecDb = { /* (이하 동일) */ };
function calculateBarcode() {
    alert("이 기능은 UI 예시입니다. JavaScript 코드의 'barcodeSpecDb' 객체에 실제 사양표 데이터를 입력해야 합니다.");
    const brand = document.getElementById('barcodeBrand').value;
    const model = document.getElementById('barcodeModel').value;
    const lens = document.getElementById('barcodeLens').value;
    const wd = parseFloat(document.getElementById('barcodeWD').value) || 200;
    const resultBox = document.getElementById('barcodeResult');
    resultBox.innerHTML = `
        <p><b>조회 결과 (예시):</b></p>
        <p>선택: ${brand} ${model} / ${lens} @ ${wd}mm</p>
        <p>FOV: 102mm x 78mm</p>
        <p>최소 엘리먼트 크기: 0.15mm (6 mil)</p>
    `;

}
