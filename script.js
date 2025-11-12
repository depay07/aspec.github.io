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
    var firstTab = document.getElementById('AreaScan'); 
    if (firstTab) {
        firstTab.style.display = 'block';
    }
    var firstTabButton = document.getElementsByClassName("tab-link")[0];
    if(firstTabButton) {
        firstTabButton.className += " active";
    }

    // 모든 탭의 드롭다운 목록 초기화
    populateModels(); // AreaScan 탭
    populateSpeedModels(); // Speed 탭
    populateDofModels(); // DOF 탭
    populateBarcodeModels(); // Barcode 탭
};


// --- 1. Area Scan 계산기 ---
function populateModels() {
    if (typeof cameraDb === 'undefined') { return; }
    const brand = document.getElementById('cameraBrand').value;
    const modelSelect = document.getElementById('cameraModel');
    modelSelect.innerHTML = '<option value="">-- 모델 선택 --</option>';
    if (!brand || !cameraDb[brand]) { return; }
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

// --- 2. Area Scan Speed 계산기 ---
function populateSpeedModels() {
    if (typeof cameraDb === 'undefined') { return; }
    const brand = document.getElementById('speed_cameraBrand').value;
    const modelSelect = document.getElementById('speed_cameraModel');
    modelSelect.innerHTML = '<option value="">-- 모델 선택 --</option>';
    if (!brand || !cameraDb[brand]) { return; }
    cameraDb[brand].forEach((cam, index) => {
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
    fpsInput.value = cam.fps ? cam.fps : ""; 
}
function calculateAreaSpeed() {
    const speed = parseFloat(document.getElementById('lineSpeedValue').value);
    const unit = document.getElementById('lineSpeedUnit').value;
    const length = parseFloat(document.getElementById('inspectionLength').value);
    const cameraFPS = parseFloat(document.getElementById('cameraFPS').value) || 0;
    const resultBox = document.getElementById('speedResult');
    if (!speed || !length || speed <= 0 || length <= 0) {
        resultBox.innerHTML = "<p>유효한 라인 속도와 검사 간격을 입력하세요.</p>";
        return;
    }
    let lineSpeed_mm_sec = (unit === 'm/min') ? (speed * 1000) / 60 : speed;
    const requiredFPS = lineSpeed_mm_sec / length;
    const allowedTime_ms = (1 / requiredFPS) * 1000;
    let fpsComparison = "";
    if (cameraFPS > 0) {
        if (cameraFPS >= requiredFPS) {
            fpsComparison = `<p class="good">선택한 카메라 FPS (${cameraFPS} Hz)는 요구 사양 (${requiredFPS.toFixed(2)} Hz)을 만족합니다. (OK)</p>`;
        } else {
            fpsComparison = `<p class="bad">선택한 카메라 FPS (${cameraFPS} Hz)가 요구 사양 (${requiredFPS.toFixed(2)} Hz)보다 낮습니다! (NG)</p>`;
        }
    } else {
        fpsComparison = `<p>카메라를 선택하면 FPS 사양을 비교할 수 있습니다.</p>`;
    }
    resultBox.innerHTML = `
        <p><b>라인 속도 (변환):</b> ${lineSpeed_mm_sec.toFixed(2)} mm/sec</p>
        <p><b>요구 FPS:</b> ${requiredFPS.toFixed(2)} Hz (Triggers/sec)</p>
        <p><b>검사당 허용 시간 (Takt):</b> ${allowedTime_ms.toFixed(2)} ms</p>
        <hr style="margin: 15px 0;">
        ${fpsComparison}
    `;
}

// --- 3. Line Scan 계산기 ---
function calculateLineScan() {
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
function populateDofModels() {
    if (typeof cameraDb === 'undefined') { return; }
    const brand = document.getElementById('dof_cameraBrand').value;
    const modelSelect = document.getElementById('dof_cameraModel');
    modelSelect.innerHTML = '<option value="">-- 모델 선택 --</option>';
    if (!brand || !cameraDb[brand]) { return; }
    cameraDb[brand].forEach((cam, index) => {
        if (cam.sensorH && cam.resH) { 
            const option = document.createElement('option');
            option.value = index;
            option.textContent = cam.name;
            modelSelect.appendChild(option);
        }
    });
}
function selectDofCamera() {
    const brand = document.getElementById('dof_cameraBrand').value;
    const modelIndex = document.getElementById('dof_cameraModel').value;
    const cocInput = document.getElementById('dof_CoC');
    if (!brand || modelIndex === "") {
        cocInput.value = "";
        return;
    }
    const cam = cameraDb[brand][modelIndex];
    if (cam.sensorH && cam.resH) {
        const pixelPitch = (cam.sensorH / cam.resH) * 1000;
        cocInput.value = pixelPitch.toFixed(2);
    } else {
        cocInput.value = "";
    }
}
function calculateDOF() {
    const f = parseFloat(document.getElementById('dofFocalLength').value);
    const wd = parseFloat(document.getElementById('dofWD').value);
    const N = parseFloat(document.getElementById('dofAperture').value);
    let c = parseFloat(document.getElementById('dof_CoC').value);
    const resultBox = document.getElementById('dofResult');
    if (!f || !wd || !N || !c) {
        resultBox.innerHTML = "<p>카메라를 선택하고, 모든 렌즈/거리 값을 입력하세요.</p>";
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

// --- 5. Barcode Reader 계산기 ---
function populateBarcodeModels() {
    if (typeof barcodeSpecDb === 'undefined') {
        alert("barcodeSpecDb.js 파일을 찾을 수 없습니다.");
        return;
    }
    const brand = document.getElementById('barcodeBrand').value;
    const modelSelect = document.getElementById('barcodeModel');
    
    modelSelect.innerHTML = '<option value="">-- 모델 선택 --</option>';
    document.getElementById('barcodeLens').innerHTML = '<option value="">-- 렌즈 선택 --</option>';

    if (!brand || !barcodeSpecDb[brand]) return;

    const models = Object.keys(barcodeSpecDb[brand]);
    models.forEach(modelKey => {
        const option = document.createElement('option');
        option.value = modelKey;
        option.textContent = modelKey; // (키 값을 그대로 이름으로 사용)
        modelSelect.appendChild(option);
    });
}

function populateBarcodeLenses() {
    const brand = document.getElementById('barcodeBrand').value;
    const modelKey = document.getElementById('barcodeModel').value;
    const lensSelect = document.getElementById('barcodeLens');

    lensSelect.innerHTML = '<option value="">-- 렌즈 선택 --</option>';

    if (!brand || !modelKey || !barcodeSpecDb[brand][modelKey]) return;

    const lenses = Object.keys(barcodeSpecDb[brand][modelKey]);
    lenses.forEach(lensKey => {
        const option = document.createElement('option');
        option.value = lensKey;
        option.textContent = lensKey; // (키 값을 그대로 이름으로 사용)
        lensSelect.appendChild(option);
    });
}

function calculateBarcode() {
    const brand = document.getElementById('barcodeBrand').value;
    const modelKey = document.getElementById('barcodeModel').value;
    const lensKey = document.getElementById('barcodeLens').value;
    const wd = parseFloat(document.getElementById('barcodeWD').value);
    const resultBox = document.getElementById('barcodeResult');

    if (!brand || !modelKey || !lensKey) {
        resultBox.innerHTML = "<p>브랜드, 모델, 렌즈를 모두 선택하세요.</p>";
        return;
    }
    if (isNaN(wd) || wd <= 0) {
        resultBox.innerHTML = "<p>유효한 작동 거리(WD)를 입력하세요.</p>";
        return;
    }
    if (typeof barcodeSpecDb === 'undefined') {
        resultBox.innerHTML = "<p>오류: barcodeSpecDb.js 파일을 찾을 수 없습니다.</p>";
        return;
    }

    const specTable = barcodeSpecDb[brand][modelKey][lensKey];
    if (!specTable || specTable.length < 2) {
        resultBox.innerHTML = "<p>오류: barcodeSpecDb.js에 이 렌즈에 대한 데이터가 2개 미만입니다.</p>";
        return;
    }

    if (wd < specTable[0].wd || wd > specTable[specTable.length - 1].wd) {
        resultBox.innerHTML = `<p class="bad">입력한 WD(${wd}mm)가 사양표의 유효 범위( ${specTable[0].wd} ~ ${specTable[specTable.length - 1].wd} mm)를 벗어났습니다.</p>`;
        return;
    }

    let p1, p2;
    for (let i = 0; i < specTable.length - 1; i++) {
        if (wd >= specTable[i].wd && wd <= specTable[i+1].wd) {
            p1 = specTable[i];
            p2 = specTable[i+1];
            break;
        }
    }

    if (!p1 || !p2) {
        resultBox.innerHTML = "<p>오류: 사양표에서 적절한 기준점을 찾지 못했습니다.</p>";
        return;
    }
    
    const interpolate = (x1, y1, x2, y2, x) => {
        if (x1 === x2) return y1;
        const ratio = (x - x1) / (x2 - x1);
        return y1 + (y2 - y1) * ratio;
    };

    const fovH = interpolate(p1.wd, p1.fovH, p2.wd, p2.fovH, wd);
    const fovV = interpolate(p1.wd, p1.fovV, p2.wd, p2.fovV, wd);
    const minEl = interpolate(p1.wd, p1.minEl, p2.wd, p2.minEl, wd);

    resultBox.innerHTML = `
        <p><b>계산된 사양 @ ${wd}mm (보간됨):</b></p>
        <p><b>FOV H:</b> ${fovH.toFixed(2)} mm</p>
        <p><b>FOV V:</b> ${fovV.toFixed(2)} mm</p>
        <p><b>최소 해상도 (1D/2D):</b> ${minEl.toFixed(3)} mm</p>
        <hr style="margin: 15px 0;">
        <p style="font-size: 14px; color: var(--text-muted);">
            (기준점: ${p1.wd}mm ~ ${p2.wd}mm 사이의 값)
        </p>
    `;
}

